import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Button from '@/components/ui/Button';

interface QuizViewerProps {
    quiz: any;
    generating: boolean;
    onGenerate: () => void;
}

export default function QuizViewer({ quiz, generating, onGenerate }: QuizViewerProps) {
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

    if (generating) {
        return (
            <View className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-8 items-center justify-center border-dashed">
                <ActivityIndicator size="small" color="#4F46E5" className="mb-3" />
                <Text className="text-slate-500 dark:text-slate-400 text-sm">Generating Quiz Questions...</Text>
            </View>
        );
    }

    if (!quiz) {
        return (
            <View className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-8 items-center justify-center border-dashed">
                <Text className="text-slate-400 dark:text-slate-500 text-center">Quiz not found.</Text>
                <Button title="Regenerate Quiz" onPress={onGenerate} variant="outline" className="mt-4" />
            </View>
        );
    }

    return (
        <View>
            <View className="mb-6">
                <Text className="text-xl font-bold text-slate-900 dark:text-white mb-2">{quiz.title}</Text>
                <Text className="text-slate-500 dark:text-gray-400 text-sm">{quiz.description}</Text>
            </View>

            {(quiz.questions || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((q: any, index: number) => {
                const isSelected = selectedOptions[q.id];
                const isCorrect = isSelected === q.correctAnswer;

                return (
                    <View key={q.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl mb-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <Text className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                            {index + 1}. {q.question}
                        </Text>

                        <View className="space-y-3">
                            {JSON.parse(JSON.stringify(q.options)).map((option: string, optIndex: number) => {
                                const isOptionSelected = isSelected === option;
                                const isOptionCorrect = q.correctAnswer === option;

                                let borderColor = 'border-slate-200 dark:border-slate-700';
                                let bgColor = 'bg-white dark:bg-slate-800';
                                let textColor = 'text-slate-600 dark:text-slate-300';

                                if (isSelected) {
                                    if (isOptionCorrect) {
                                        borderColor = 'border-green-500';
                                        bgColor = 'bg-green-50 dark:bg-green-900/20';
                                        textColor = 'text-green-700 dark:text-green-400';
                                    } else if (isOptionSelected) {
                                        borderColor = 'border-red-500';
                                        bgColor = 'bg-red-50 dark:bg-red-900/20';
                                        textColor = 'text-red-700 dark:text-red-400';
                                    }
                                }

                                return (
                                    <TouchableOpacity
                                        key={optIndex}
                                        disabled={!!isSelected}
                                        onPress={() => setSelectedOptions(prev => ({ ...prev, [q.id]: option }))}
                                        className={`p-3 rounded-xl border ${borderColor} ${bgColor} mb-2 flex-row items-center`}
                                    >
                                        <View className={`w-5 h-5 rounded-full border mr-3 items-center justify-center ${isSelected && (isOptionCorrect || isOptionSelected) ? borderColor : 'border-slate-300 dark:border-slate-500'}`}>
                                            {isSelected && isOptionCorrect && <Feather name="check" size={12} color="green" />}
                                            {isSelected && isOptionSelected && !isOptionCorrect && <Feather name="x" size={12} color="red" />}
                                        </View>
                                        <Text className={`${textColor} font-medium flex-1`}>{option}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {isSelected && (
                            <View className={`mt-4 p-3 rounded-xl ${isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                                <Text className={`text-sm font-bold mb-1 ${isCorrect ? 'text-green-800 dark:text-green-400' : 'text-orange-800 dark:text-orange-400'}`}>
                                    {isCorrect ? 'Correct!' : 'Incorrect'}
                                </Text>
                                <Text className="text-xs text-slate-600 dark:text-slate-300 leading-5">
                                    {q.explanation}
                                </Text>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
}
