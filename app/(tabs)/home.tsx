import { View, Text, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { db } from '@/lib/db';
import { id } from '@instantdb/react-native';
import LoadingScreen from '@/components/LoadingScreen';
import Button from '@/components/ui/Button';
import { useAlert } from '@/components/ui/CustomAlert';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
    const router = useRouter();
    const { user } = db.useAuth();
    const userId = user?.id;
    const { showAlert } = useAlert();
    const [seeding, setSeeding] = useState(false);
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Fetch Data
    const { data, isLoading, error } = db.useQuery(
        userId ? {
            profiles: {
                $: {
                    where: {
                        "user.id": userId
                    }
                }
            },
            recommendedCourses: {
                $: {
                    where: {
                        "user.id": userId
                    }
                }
            },
            enrollments: {
                $: {
                    where: {
                        "user.id": userId
                    }
                },
                course: {}
            }
        } : null
    );

    if (isLoading) return <LoadingScreen />;

    const profile = data?.profiles?.[0];
    const courses = data?.recommendedCourses || [];
    const enrollments = data?.enrollments || [];

    // Create a Set of enrolled course IDs for quick lookup
    const enrolledCourseIds = new Set(enrollments.map(e => e.course?.id).filter(Boolean));

    // Greeting logic
    const hours = new Date().getHours();
    const greeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening';

    const handleGenerateRecommendations = async () => {
        setSeeding(true);
        try {
            let generatedCourses = [];
            try {
                // Try to generate via AI
                if (!profile) throw new Error("No profile data");
                const { generateLearningPath } = await import('@/lib/ai');
                generatedCourses = await generateLearningPath(profile);
            } catch (aiError) {
                console.log("AI Generation skipped/failed, using static data:", aiError);
                // Fallback to static data matching the 'recommendedCourses' schema
                generatedCourses = [
                    { title: 'Advanced React Native', description: 'Build premium mobile apps.', category: 'Mobile Dev', level: 'NSQF Level 6', duration: '3 Months', rating: 4.9, enrolledCount: 1500 },
                    { title: 'AI for Everyone', description: 'Understand the basics of AI.', category: 'Data Science', level: 'NSQF Level 5', duration: '2 Months', rating: 4.7, enrolledCount: 3200 },
                    { title: 'Modern UI/UX Design', description: 'Create stunning interfaces.', category: 'Design', level: 'NSQF Level 5', duration: '4 Months', rating: 4.8, enrolledCount: 950 },
                    { title: 'Python for Finance', description: 'Analyze financial data.', category: 'Finance', level: 'NSQF Level 6', duration: '3 Months', rating: 4.6, enrolledCount: 700 },
                    { title: 'Effective Communication', description: 'Speak with confidence.', category: 'Soft Skills', level: 'NSQF Level 4', duration: '1 Month', rating: 4.9, enrolledCount: 5000 },
                ];
            }

            // Upload courses to InstantDB (recommendedCourses table)
            // Add a link to the user so they are personalized
            const txs = generatedCourses.map((c: any) => {
                const courseId = id();
                return db.tx.recommendedCourses[courseId].update({
                    ...c,
                    rating: c.rating || 4.5,
                    enrolledCount: c.enrolledCount || Math.floor(Math.random() * 1000)
                }).link({ user: userId });
            });

            await db.transact(txs);
            showAlert({ title: "Success", message: "Learning path generated!", type: 'success' });
        } catch (err) {
            console.error(err);
            showAlert({ title: "Error", message: "Failed to generate recommendations.", type: 'error' });
        } finally {
            setSeeding(false);
        }
    };

    const handleEnroll = async (courseId: string) => {
        if (!userId) return;
        try {
            // Check if already enrolled
            if (enrolledCourseIds.has(courseId)) {
                showAlert({ title: "Info", message: "You are already enrolled in this course.", type: 'info' });
                return;
            }

            const enrollmentId = id();
            // Link to the 'recommendedCourses' entity via the 'course' field in enrollments
            await db.transact([
                db.tx.enrollments[enrollmentId].update({
                    progress: 0,
                    status: 'active',
                    lastAccessed: new Date().toISOString()
                }).link({ user: userId, course: courseId })
            ]);
            showAlert({ title: "Enrolled", message: "You have successfully enrolled!", type: 'success' });
        } catch (err) {
            console.error(err);
            showAlert({ title: "Error", message: "Enrollment failed.", type: 'error' });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-black">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header Section */}
                <View className="px-6 pt-6 pb-2">
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-slate-500 dark:text-gray-400 text-lg font-medium tracking-wide">{greeting},</Text>
                            <Text className="text-3xl font-bold text-slate-900 dark:text-white">{profile?.fullName || "Learner"}</Text>
                        </View>
                        <TouchableOpacity className="w-12 h-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl items-center justify-center shadow-sm">
                            <Feather name="bell" size={22} color={isDark ? "#cbd5e1" : "#475569"} />
                            <View className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* My Learning Path */}
                <View className="mb-8">
                    <View className="flex-row justify-between items-center px-6 mb-4">
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">My Learning Path</Text>
                        {enrollments.length > 0 && (
                            <TouchableOpacity>
                                <Text className="text-indigo-600 dark:text-indigo-400 font-semibold">See All</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {enrollments.length > 0 ? (
                        <FlatList
                            horizontal
                            data={enrollments}
                            keyExtractor={(item) => item.id}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 24 }}
                            renderItem={({ item }) => {
                                const course = item.course;
                                return (
                                    <View className="bg-white dark:bg-slate-900 p-5 rounded-3xl mr-5 w-72 h-48 justify-between border border-slate-100 dark:border-slate-800 shadow-sm shadow-indigo-100 dark:shadow-none">
                                        <View>
                                            <View className="flex-row justify-between items-start mb-3">
                                                <View className="bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900">
                                                    <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">{course?.category || 'General'}</Text>
                                                </View>
                                                <View className="bg-green-50 dark:bg-green-950 px-2 py-1 rounded-full">
                                                    <Text className="text-green-700 dark:text-green-400 text-xs font-bold">{item.progress || 0}%</Text>
                                                </View>
                                            </View>
                                            <Text className="text-lg font-bold text-slate-900 dark:text-white leading-6 mb-1" numberOfLines={2}>{course?.title || 'Unknown Course'}</Text>
                                        </View>

                                        <View>
                                            <View className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                                                <View style={{ width: `${item.progress || 0}%` }} className="h-full bg-indigo-500 rounded-full" />
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => router.push(`/course/${course?.id}`)}
                                                className="bg-slate-900 dark:bg-indigo-600 py-2.5 rounded-xl items-center"
                                            >
                                                <Text className="text-white font-semibold text-xs">Continue Learning</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            }}
                        />
                    ) : (
                        <View className="px-6">
                            <View className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 p-8 rounded-3xl items-center justify-center border-dashed">
                                <View className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full items-center justify-center mb-4 shadow-sm">
                                    <Feather name="book-open" size={28} color="#4F46E5" />
                                </View>
                                <Text className="text-indigo-900 dark:text-indigo-200 font-bold text-lg mb-1">Start Your Journey</Text>
                                <Text className="text-indigo-600/80 dark:text-indigo-400 text-center mb-0">Enroll in a course to track your progress.</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Recommended Section */}
                <View className="px-6 mb-6">
                    <View className="flex-row justify-between items-center mb-5">
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">Recommended for You</Text>
                        <TouchableOpacity onPress={handleGenerateRecommendations}>
                            <Feather name="refresh-cw" size={18} color={seeding ? "#4F46E5" : "#94a3b8"} />
                        </TouchableOpacity>
                    </View>

                    {courses.length === 0 ? (
                        <View className="items-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <Image
                                source={{ uri: "https://illustrations.popsy.co/amber/surr-searching.svg" }}
                                style={{ width: 120, height: 120, marginBottom: 16 }}
                                resizeMode="contain"
                            />
                            <Text className="text-slate-400 dark:text-gray-500 font-medium mb-6">No recommendations found.</Text>
                            <Button title={seeding ? "Generating..." : "Generate AI Path"} onPress={handleGenerateRecommendations} loading={seeding} className="w-48" />
                        </View>
                    ) : (
                        courses.map((course, index) => {
                            const isEnrolled = enrolledCourseIds.has(course.id);
                            return (
                                <View key={course.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl mb-4 border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200 dark:shadow-none">
                                    <View className="flex-row">
                                        <View className={`w-20 h-20 rounded-2xl items-center justify-center mr-4 ${['bg-orange-50 dark:bg-orange-900', 'bg-blue-50 dark:bg-blue-900', 'bg-purple-50 dark:bg-purple-900', 'bg-rose-50 dark:bg-rose-900'][index % 4]}`}>
                                            <Feather name={['code', 'bar-chart-2', 'pen-tool', 'cpu'][index % 4] as any} size={28} color={isDark ? "#e2e8f0" : "#475569"} />
                                        </View>
                                        <View className="flex-1 justify-between py-1">
                                            <View>
                                                <View className="flex-row justify-between items-start">
                                                    <Text className="text-base font-bold text-slate-900 dark:text-white flex-1 mr-2 leading-tight">{course.title}</Text>
                                                    <View className="flex-row items-center bg-yellow-50 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded-md border border-yellow-100 dark:border-yellow-800">
                                                        <Feather name="star" size={10} color="#F59E0B" />
                                                        <Text className="text-[10px] font-bold text-yellow-700 dark:text-yellow-400 ml-1">{course.rating}</Text>
                                                    </View>
                                                </View>
                                                <Text className="text-slate-500 dark:text-gray-400 text-xs mt-1" numberOfLines={1}>{course.level} • {course.duration}</Text>
                                            </View>

                                            <View className="flex-row justify-between items-end mt-2">
                                                <Text className="text-xs text-slate-400 dark:text-gray-500 font-medium">{course.enrolledCount}+ Enrolled</Text>
                                                {isEnrolled ? (
                                                    <View
                                                        className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-xl flex-row items-center"
                                                    >
                                                        <Feather name="check" size={14} color={isDark ? "#4ade80" : "#15803d"} style={{ marginRight: 4 }} />
                                                        <Text className="text-green-800 dark:text-green-400 text-xs font-bold">Enrolled</Text>
                                                    </View>
                                                ) : (
                                                    <TouchableOpacity
                                                        onPress={() => handleEnroll(course.id)}
                                                        className="bg-slate-900 dark:bg-indigo-600 px-4 py-2 rounded-xl"
                                                    >
                                                        <Text className="text-white text-xs font-bold">Enroll Now</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
