import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { db } from '@/lib/db';
import Button from '@/components/ui/Button';
import { useAlert } from '@/components/ui/CustomAlert';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function CourseDetailScreen() {
    const { id } = useLocalSearchParams();
    const courseId = Array.isArray(id) ? id[0] : id;
    const router = useRouter();
    const { user } = db.useAuth();
    const { showAlert } = useAlert();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [generating, setGenerating] = useState(false);


    const { data, isLoading, error } = db.useQuery({
        recommendedCourses: {
            $: {
                where: {
                    id: courseId || ""
                }
            }
        },
        profiles: {
            $: {
                where: {
                    "user.id": user?.id
                }
            }
        }
    });

    const course = data?.recommendedCourses?.[0];
    const profile = data?.profiles?.[0];

    useEffect(() => {
        // If course loads and has no modules, auto-generate them
        if (course && !course.modules && !generating) {
            generateContent();
        }
    }, [course]);

    const generateContent = async () => {
        if (!course || generating) return;
        setGenerating(true);
        try {
            console.log("Generating content for:", course.title);
            const { generateCourseContent } = await import('@/lib/ai');
            const modules = await generateCourseContent(course.title, profile);

            await db.transact(
                db.tx.recommendedCourses[course.id].update({
                    modules: modules
                })
            );
            showAlert({ title: "Content Ready", message: "Course content has been generated!", type: 'success' });
        } catch (err) {
            console.error(err);
            showAlert({ title: "Error", message: "Failed to generate course content.", type: 'error' });
            // Fallback content in case of error
            const fallbackModules = [
                { title: 'Introduction', description: 'Overview of the course.', duration: '15 mins', type: 'video', content: 'Welcome to the course.' },
                { title: 'Basics', description: 'Fundamental concepts.', duration: '45 mins', type: 'article', content: 'Read Chapter 1.' }
            ];
            await db.transact(
                db.tx.recommendedCourses[course.id].update({
                    modules: fallbackModules
                })
            );
        } finally {
            setGenerating(false);
        }
    };

    if (isLoading) return (
        <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-black">
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text className="text-slate-500 dark:text-gray-400 mt-4">Loading Course...</Text>
        </View>
    );

    if (!course) return (
        <SafeAreaView className="flex-1 items-center justify-center bg-slate-50 dark:bg-black px-6">
            <Feather name="alert-circle" size={48} color={isDark ? "#94a3b8" : "#94a3b8"} />
            <Text className="text-slate-500 dark:text-gray-400 mt-4 text-center">Course not found or invalid ID.</Text>
            <Button title="Go Back" onPress={() => router.back()} variant="outline" className="mt-6" />
        </SafeAreaView>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-black">
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header with Back Button */}
                <View className="bg-white dark:bg-slate-900 px-6 pb-6 pt-2 border-b border-slate-100 dark:border-slate-800 shadow-sm z-10">
                    <TouchableOpacity onPress={() => router.back()} className="mb-4 w-10 h-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">
                        <Feather name="arrow-left" size={24} color={isDark ? "#fff" : "#0f172a"} />
                    </TouchableOpacity>

                    <View className="flex-row items-start">
                        <View className={`w-16 h-16 rounded-2xl items-center justify-center mr-4 bg-indigo-50 dark:bg-indigo-950`}>
                            <Feather name="book" size={28} color="#4F46E5" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">{course.category}</Text>
                            <Text className="text-2xl font-bold text-slate-900 dark:text-white leading-8">{course.title}</Text>
                            <View className="flex-row items-center mt-2">
                                <Feather name="clock" size={14} color={isDark ? "#94a3b8" : "#64748b"} />
                                <Text className="text-slate-500 dark:text-gray-400 text-xs ml-1 mr-4">{course.duration}</Text>
                                <Feather name="bar-chart" size={14} color={isDark ? "#94a3b8" : "#64748b"} />
                                <Text className="text-slate-500 dark:text-gray-400 text-xs ml-1">{course.level}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Content Section */}
                <View className="px-6 py-6">
                    <Text className="text-slate-500 dark:text-gray-300 leading-6 mb-8">{course.description}</Text>

                    <Text className="text-xl font-bold text-slate-900 dark:text-white mb-4">Course Curriculum</Text>

                    {generating ? (
                        <View className="items-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 border-dashed">
                            <ActivityIndicator size="large" color="#4F46E5" className="mb-4" />
                            <Text className="text-slate-600 dark:text-gray-300 font-medium text-lg">Designing Curriculum...</Text>
                            <Text className="text-slate-400 dark:text-gray-500 text-sm mt-1">Our AI is tailoring modules for you.</Text>
                        </View>
                    ) : (
                        <View>
                            {course.modules?.map((module: any, index: number) => (
                                <View key={index} className="bg-white dark:bg-slate-900 p-5 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800 shadow-sm flex-row relative overflow-hidden">
                                    {/* Left decorative bar */}
                                    <View className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500" />

                                    <View className="mr-4 mt-1">
                                        <View className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
                                            <Text className="text-slate-500 dark:text-gray-400 font-bold text-xs">{index + 1}</Text>
                                        </View>
                                    </View>

                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-start mb-1">
                                            <Text className="text-base font-bold text-slate-900 dark:text-white flex-1 mr-2">{module.title}</Text>
                                            <View className={`px-2 py-0.5 rounded-md border ${module.type === 'video' ? 'bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900' : module.type === 'quiz' ? 'bg-purple-50 dark:bg-purple-950 border-purple-100 dark:border-purple-900' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
                                                <Text className={`text-[10px] font-bold uppercase ${module.type === 'video' ? 'text-blue-700 dark:text-blue-300' : module.type === 'quiz' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'}`}>{module.type}</Text>
                                            </View>
                                        </View>

                                        <Text className="text-slate-500 dark:text-gray-400 text-sm mb-3 leading-5">{module.description}</Text>

                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center">
                                                <Feather name="clock" size={12} color={isDark ? "#94a3b8" : "#94a3b8"} />
                                                <Text className="text-slate-400 dark:text-gray-500 text-xs ml-1.5 font-medium">{module.duration}</Text>
                                            </View>
                                            <TouchableOpacity className="flex-row items-center">
                                                <Text className="text-indigo-600 font-bold text-xs mr-1">Start</Text>
                                                <Feather name="chevron-right" size={14} color="#4F46E5" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}
                            {(!course.modules || course.modules.length === 0) && (
                                <View className="items-center py-8">
                                    <Text className="text-slate-400 dark:text-gray-500">No modules found. Try refreshing.</Text>
                                    <Button title="Retry Generation" onPress={generateContent} variant="outline" className="mt-4" />
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
