import { View, Text, ScrollView, TouchableOpacity, FlatList, Image, RefreshControl } from 'react-native';
import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { db } from '@/lib/db';
import LoadingScreen from '@/components/LoadingScreen';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function MyCourses() {
    const router = useRouter();
    const { user } = db.useAuth();
    const userId = user?.id;
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [refreshing, setRefreshing] = useState(false);

    // Fetch Enrollments
    const { data, isLoading, error } = db.useQuery(
        userId ? {
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

    const onRefresh = useCallback(() => {
        setRefreshing(true);
    }, []);

    if (isLoading && !data) return <LoadingScreen />;

    const enrollments = data?.enrollments || [];
    const activeCourses = enrollments.filter(e => e.status !== 'completed');
    const completedCourses = enrollments.filter(e => e.status === 'completed');

    const renderCourseCard = ({ item }: { item: any }) => {
        const course = item.course;
        if (!course) return null;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push(`/course/${course.id}`)}
                className="bg-white dark:bg-slate-900 mb-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200 dark:shadow-none overflow-hidden"
            >
                <View className="p-5">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                            <Feather name="book" size={20} color={isDark ? "#818cf8" : "#4f46e5"} />
                        </View>
                        <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <Text className="text-xs font-bold text-slate-600 dark:text-slate-300 capitalize">{item.status || 'Active'}</Text>
                        </View>
                    </View>

                    <Text className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-6">{course.title}</Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-sm mb-4" numberOfLines={2}>{course.description}</Text>

                    <View className="mb-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">Progress</Text>
                            <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{item.progress || 0}%</Text>
                        </View>
                        <View className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <View
                                style={{ width: `${item.progress || 0}%` }}
                                className="h-full bg-indigo-500 rounded-full"
                            />
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                        <View className="flex-row items-center">
                            <Feather name="clock" size={14} color={isDark ? "#94a3b8" : "#64748b"} />
                            <Text className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">{course.duration || 'Flexible'}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-indigo-600 dark:text-indigo-400 text-sm font-bold mr-1">Continue</Text>
                            <Feather name="arrow-right" size={14} color={isDark ? "#818cf8" : "#4f46e5"} />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-black">
            <View className="px-6 pt-6 pb-4">
                <Text className="text-3xl font-bold text-slate-900 dark:text-white">My Courses</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-base mt-1">Manage your enrolled courses</Text>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? "#fff" : "#000"} />
                }
            >
                {/* Active Courses */}
                {activeCourses.length > 0 ? (
                    <View>
                        <Text className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 mt-2">In Progress</Text>
                        {activeCourses.map((enrollment) => (
                            <View key={enrollment.id}>
                                {renderCourseCard({ item: enrollment })}
                            </View>
                        ))}
                    </View>
                ) : (
                    enrollments.length === 0 && (
                        <View className="items-center justify-center py-20">
                            <View className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full items-center justify-center mb-4">
                                <Feather name="book-open" size={32} color={isDark ? "#818cf8" : "#4f46e5"} />
                            </View>
                            <Text className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Courses Yet</Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-center mb-6 px-10">
                                You haven't enrolled in any courses yet. Explore our catalog to start learning.
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/home')}
                                className="bg-indigo-600 px-6 py-3 rounded-xl shadow-lg shadow-indigo-300 dark:shadow-none"
                            >
                                <Text className="text-white font-bold">Explore Courses</Text>
                            </TouchableOpacity>
                        </View>
                    )
                )}

                {/* Completed Courses */}
                {completedCourses.length > 0 && (
                    <View className="mt-6">
                        <Text className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Completed</Text>
                        {completedCourses.map((enrollment) => (
                            <View key={enrollment.id} className="opacity-80">
                                {renderCourseCard({ item: enrollment })}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
