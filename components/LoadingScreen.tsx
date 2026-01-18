import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { ActivityIndicator } from 'react-native'

const LoadingScreen = () => {
    return (
        <View className='flex-1 items-center justify-center bg-gray-50'>
            <ActivityIndicator size="large" color="indigo" />
        </View>
    )
}

export default LoadingScreen

const styles = StyleSheet.create({})