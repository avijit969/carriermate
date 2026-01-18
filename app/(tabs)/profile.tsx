import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { db } from '@/lib/db'

export default function Profile() {
    return (
        <SafeAreaView className='flex-1 bg-gray-50'>
            <View className='p-6'>
                <Text className='text-2xl font-bold text-gray-900'>Profile</Text>

                <TouchableOpacity onPress={() => db.auth.signOut()} className='mt-6 bg-indigo-600 px-6 py-3 rounded-2xl items-center'>
                    <Text className='text-white font-semibold text-lg'>Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}
