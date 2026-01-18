import { id } from '@instantdb/react-native';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { db } from '@/lib/db';
import { useColorScheme } from '@/hooks/useColorScheme';
import Button from '@/components/ui/Button';
import VideoPlayer from '@/components/module/VideoPlayer';
import ArticleViewer from '@/components/module/ArticleViewer';
import QuizViewer from '@/components/module/QuizViewer';
import ModuleNavigation from '@/components/module/ModuleNavigation';

export default function ModuleScreen() {
    const { id: courseIdParam, moduleId: moduleIdParam } = useLocalSearchParams();
    const courseId = Array.isArray(courseIdParam) ? courseIdParam[0] : courseIdParam;
    const moduleId = Array.isArray(moduleIdParam) ? moduleIdParam[0] : moduleIdParam;

    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [quizGenerating, setQuizGenerating] = useState(false);

    const { data, isLoading } = db.useQuery({
        modules: {
            $: {
                where: {
                    id: moduleId
                }
            },
            quiz: {
                questions: {}
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

    const module = data?.modules?.[0];
    const quizData = module?.quiz;
    const quiz = Array.isArray(quizData) ? quizData[0] : quizData;

    const course = data?.recommendedCourses?.[0];
    const allModules = (course?.modules || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    const generateQuizContent = async () => {
        if (quizGenerating || !module || !course) return;
        setQuizGenerating(true);
        try {
            const { generateQuiz } = await import('@/lib/ai');
            const generatedQuiz = await generateQuiz(module.title, course.title);

            const quizId = id();
            const txs: any[] = [
                // Create Quiz Link to Module
                db.tx.quizzes[quizId].update({
                    title: generatedQuiz.title,
                    description: generatedQuiz.description
                }).link({ module: module.id }),
            ];

            // Create Questions Link to Quiz
            generatedQuiz.questions.forEach((q: any, index: number) => {
                const questionId = id();
                txs.push(
                    db.tx.questions[questionId].update({
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        order: index
                    }).link({ quiz: quizId })
                );
            });

            await db.transact(txs);
        } catch (error) {
            console.error("Failed to generate quiz", error);
            Alert.alert("Error", "Could not generate quiz. Please try again.");
        } finally {
            setQuizGenerating(false);
        }
    };

    useEffect(() => {
        if (module && module.type === 'quiz' && !quiz && !quizGenerating && !isLoading) {
            generateQuizContent();
        }
    }, [module, quiz, isLoading]);

    if (isLoading) return (
        <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-black">
            <ActivityIndicator size="large" color="#4F46E5" />
        </View>
    );

    if (!module) return (
        <SafeAreaView className="flex-1 items-center justify-center bg-slate-50 dark:bg-black">
            <Text className="text-slate-500 dark:text-gray-400">Module not found.</Text>
            <Button title="Go Back" onPress={() => router.back()} className="mt-4" />
        </SafeAreaView>
    );

    const currentIndex = allModules.findIndex((m: any) => m.id === module.id);
    const nextModule = allModules[currentIndex + 1];
    const prevModule = allModules[currentIndex - 1];

    const handlePrev = () => {
        if (prevModule) router.replace(`/course/${courseId}/module/${prevModule.id}`);
    };

    const handleNext = () => {
        if (nextModule) router.replace(`/course/${courseId}/module/${nextModule.id}`);
    };

    const handleFinish = () => {
        router.replace(`/course/${courseId}`);
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

                {module.type === 'video' && <VideoPlayer content={module.content} />}

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

                    {module.type === 'article' && <ArticleViewer content={module.content} />}

                    {module.type === 'quiz' && (
                        <QuizViewer
                            quiz={quiz}
                            generating={quizGenerating}
                            onGenerate={generateQuizContent}
                        />
                    )}

                    {module.type !== 'video' && module.type !== 'article' && module.type !== 'quiz' && (
                        <View className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-8 items-center justify-center border-dashed">
                            <Feather name="tool" size={32} color={isDark ? "#475569" : "#cbd5e1"} />
                            <Text className="text-slate-400 dark:text-slate-500 mt-4 text-center">Interactive content for '{module.type}' coming soon.</Text>
                        </View>
                    )}

                    <ModuleNavigation
                        prevModule={prevModule}
                        nextModule={nextModule}
                        onPrev={handlePrev}
                        onNext={handleNext}
                        onFinish={handleFinish}
                        isDark={isDark}
                    />

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
