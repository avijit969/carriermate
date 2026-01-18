import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Explore() {
    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
            <Text className="text-gray-900 dark:text-white">Explore</Text>
        </SafeAreaView>
    )
}
