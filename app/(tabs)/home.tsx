import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { db } from '@/lib/db';
import LoadingScreen from '@/components/LoadingScreen';

export default function HomeScreen() {
    const { user } = db.useAuth();
    const userId = user?.id;

    const { data, isLoading, error } = db.useQuery(
        userId ? { profiles: { $: { where: { "user.id": userId } } } } : null
    );

    if (isLoading) return <LoadingScreen />;

    // Determine greeting based on time of day
    const hours = new Date().getHours();
    const greeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening';

    const profile = data?.profiles?.[0];
    const fullName = profile?.fullName || "User";
    const careerGoal = profile?.careerGoal || "Set a Goal";

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="p-6">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-8">
                    <View>
                        <Text className="text-gray-500 text-lg">{greeting},</Text>
                        <Text className="text-2xl font-bold text-gray-900">{fullName}</Text>
                    </View>
                    <TouchableOpacity className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center">
                        <Feather name="bell" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>

                {/* Career Path Card */}
                <View className="bg-indigo-600 rounded-3xl p-6 shadow-lg shadow-indigo-300 mb-8">
                    <View className="flex-row justify-between items-start mb-4">
                        <View>
                            <Text className="text-indigo-100 font-medium mb-1">Current Goal</Text>
                            <Text className="text-white text-2xl font-bold">{careerGoal}</Text>
                        </View>
                        <View className="bg-white/20 p-2 rounded-xl">
                            <Feather name="target" size={24} color="white" />
                        </View>
                    </View>
                    <View className="flex-row items-center gap-2 mb-4">
                        <View className="flex-1 h-2 bg-indigo-900/30 rounded-full overflow-hidden">
                            <View className="w-1/3 h-full bg-white rounded-full" />
                        </View>
                        <Text className="text-white font-medium">35%</Text>
                    </View>
                    <TouchableOpacity className="bg-white py-3 rounded-xl items-center">
                        <Text className="text-indigo-600 font-bold">Continue Learning</Text>
                    </TouchableOpacity>
                </View>

                {/* Recommended Actions */}
                <Text className="text-xl font-bold text-gray-900 mb-4">Recommended for You</Text>
                <View className="flex-row gap-4 mb-8">
                    <TouchableOpacity className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <View className="w-10 h-10 bg-orange-100 items-center justify-center rounded-full mb-3">
                            <Feather name="book-open" size={20} color="#EA580C" />
                        </View>
                        <Text className="font-bold text-gray-900 mb-1">Scholarships</Text>
                        <Text className="text-gray-500 text-xs">Find financial aid</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <View className="w-10 h-10 bg-blue-100 items-center justify-center rounded-full mb-3">
                            <Feather name="briefcase" size={20} color="#2563EB" />
                        </View>
                        <Text className="font-bold text-gray-900 mb-1">Internships</Text>
                        <Text className="text-gray-500 text-xs">Gain experience</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Activity */}
                <Text className="text-xl font-bold text-gray-900 mb-4">Recent Activity</Text>
                <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <View className="flex-row items-center mb-4">
                        <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                            <Feather name="check" size={20} color="#16A34A" />
                        </View>
                        <View>
                            <Text className="font-bold text-gray-900">Profile Completed</Text>
                            <Text className="text-gray-500 text-xs">Just now</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
