import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { ActivityIndicator } from 'react-native'
import { useColorScheme } from 'react-native'

const LoadingScreen = () => {
    const isDark = useColorScheme() === 'dark'
    return (
        <View className={`flex-1 items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
        </View>
    )
}

export default LoadingScreen

const styles = StyleSheet.create({})