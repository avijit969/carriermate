import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ModuleNavigationProps {
    prevModule: any;
    nextModule: any;
    onPrev: () => void;
    onNext: () => void;
    onFinish: () => void;
    isDark: boolean;
}

export default function ModuleNavigation({ prevModule, nextModule, onPrev, onNext, onFinish, isDark }: ModuleNavigationProps) {
    return (
        <View className="flex-row justify-between items-center mt-4">
            {prevModule ? (
                <TouchableOpacity
                    onPress={onPrev}
                    className="flex-row items-center px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                    <Feather name="chevron-left" size={20} color={isDark ? "#cbd5e1" : "#475569"} />
                    <Text className="ml-2 font-medium text-slate-700 dark:text-slate-300">Previous</Text>
                </TouchableOpacity>
            ) : <View />}

            {nextModule ? (
                <TouchableOpacity
                    onPress={onNext}
                    className="flex-row items-center px-6 py-3 rounded-xl bg-indigo-600"
                >
                    <Text className="mr-2 font-bold text-white">Next Lesson</Text>
                    <Feather name="chevron-right" size={20} color="white" />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    onPress={onFinish}
                    className="flex-row items-center px-6 py-3 rounded-xl bg-green-600"
                >
                    <Text className="mr-2 font-bold text-white">Finish Course</Text>
                    <Feather name="check-circle" size={20} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
}
