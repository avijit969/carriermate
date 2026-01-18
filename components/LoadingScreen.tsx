import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { ActivityIndicator } from 'react-native'

const LoadingScreen = () => {
    return (
        <View>
            <ActivityIndicator size="large" color="indigo" />
        </View>
    )
}

export default LoadingScreen

const styles = StyleSheet.create({})