import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { db } from '@/lib/db';
import YoutubePlayer from "react-native-youtube-iframe";
import { useColorScheme } from '@/hooks/useColorScheme';
import Button from '@/components/ui/Button';

export default function ModuleScreen() {
    const { id: courseIdParam, moduleId: moduleIdParam } = useLocalSearchParams();
    const courseId = Array.isArray(courseIdParam) ? courseIdParam[0] : courseIdParam;
    const moduleId = Array.isArray(moduleIdParam) ? moduleIdParam[0] : moduleIdParam;

    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { data, isLoading } = db.useQuery({
        modules: {
            $: {
                where: {
                    id: moduleId
                }
            }
        },
        recommendedCourses: {
            $: {
                where: {
                    id: courseId
                }
            },
            modules: {} // Fetch all modules to determine next/prev navigation
        }
    });

    if (isLoading) return (
        <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-black">
            <ActivityIndicator size="large" color="#4F46E5" />
        </View>
    );

    const module = data?.modules?.[0];
    const course = data?.recommendedCourses?.[0];
    const allModules = (course?.modules || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    if (!module) return (
        <SafeAreaView className="flex-1 items-center justify-center bg-slate-50 dark:bg-black">
            <Text className="text-slate-500 dark:text-gray-400">Module not found.</Text>
            <Button title="Go Back" onPress={() => router.back()} className="mt-4" />
        </SafeAreaView>
    );

    const currentIndex = allModules.findIndex((m: any) => m.id === module.id);
    const nextModule = allModules[currentIndex + 1];
    const prevModule = allModules[currentIndex - 1];

    const getYoutubeVideoId = (url: string) => {
        if (!url) return null;
        const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([^#&?]*)/);
        return videoIdMatch ? videoIdMatch[1] : null;
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-black">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Feather name="arrow-left" size={24} color={isDark ? "white" : "#0f172a"} />
                </TouchableOpacity>
                <View className="ml-4 flex-1">
                    <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-0.5">
                        Module {currentIndex + 1} of {allModules.length}
                    </Text>
                    <Text className="text-lg font-bold text-slate-900 dark:text-white" numberOfLines={1}>
                        {module.title}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {module.type === 'video' ? (
                    <View className="w-full bg-black">
                        <YoutubePlayer
                            height={220}
                            play={false}
                            videoId={getYoutubeVideoId(module.content) || undefined}
                        />
                    </View>
                ) : null}

                <View className="px-6 py-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                            <Feather name={module.type === 'video' ? 'video' : module.type === 'article' ? 'file-text' : 'help-circle'} size={14} color={isDark ? "#94a3b8" : "#64748b"} />
                            <Text className="text-xs font-medium text-slate-600 dark:text-slate-300 ml-2 capitalize">{module.type}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Feather name="clock" size={14} color={isDark ? "#94a3b8" : "#64748b"} />
                            <Text className="text-sm text-slate-500 dark:text-slate-400 ml-1.5">{module.duration}</Text>
                        </View>
                    </View>

                    <Text className="text-base text-slate-600 dark:text-slate-300 leading-7 mb-8">
                        {module.description}
                    </Text>

                    {module.type === 'article' && (
                        <View className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
                            <Text className="text-lg font-serif text-slate-800 dark:text-slate-200 leading-8">
                                {module.content}
                            </Text>
                        </View>
                    )}

                    {module.type !== 'video' && module.type !== 'article' && (
                        <View className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-8 items-center justify-center border-dashed">
                            <Feather name="tool" size={32} color={isDark ? "#475569" : "#cbd5e1"} />
                            <Text className="text-slate-400 dark:text-slate-500 mt-4 text-center">Interactive content for '{module.type}' coming soon.</Text>
                        </View>
                    )}


                    {/* Navigation Buttons */}
                    <View className="flex-row justify-between items-center mt-4">
                        {prevModule ? (
                            <TouchableOpacity
                                onPress={() => router.replace(`/course/${courseId}/module/${prevModule.id}`)}
                                className="flex-row items-center px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                                <Feather name="chevron-left" size={20} color={isDark ? "#cbd5e1" : "#475569"} />
                                <Text className="ml-2 font-medium text-slate-700 dark:text-slate-300">Previous</Text>
                            </TouchableOpacity>
                        ) : <View />}

                        {nextModule ? (
                            <TouchableOpacity
                                onPress={() => router.replace(`/course/${courseId}/module/${nextModule.id}`)}
                                className="flex-row items-center px-6 py-3 rounded-xl bg-indigo-600"
                            >
                                <Text className="mr-2 font-bold text-white">Next Lesson</Text>
                                <Feather name="chevron-right" size={20} color="white" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => router.replace(`/course/${courseId}`)}
                                className="flex-row items-center px-6 py-3 rounded-xl bg-green-600"
                            >
                                <Text className="mr-2 font-bold text-white">Finish Course</Text>
                                <Feather name="check-circle" size={20} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
