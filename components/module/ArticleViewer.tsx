import React from 'react';
import { View, Text } from 'react-native';

interface ArticleViewerProps {
    content: string;
}

export default function ArticleViewer({ content }: ArticleViewerProps) {
    return (
        <View className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
            <Text className="text-lg font-serif text-slate-800 dark:text-slate-200 leading-8">
                {content}
            </Text>
        </View>
    );
}
