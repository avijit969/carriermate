import { View, Text, TouchableOpacity, Image, ScrollView, Switch } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '@/lib/db';
import { Feather } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import { useAlert } from '@/components/ui/CustomAlert';
import * as ImagePicker from 'expo-image-picker';
import LoadingScreen from '@/components/LoadingScreen';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function Profile() {
    const { user } = db.useAuth();
    const userId = user?.id;
    const { showAlert } = useAlert();
    const { colorScheme, theme, setTheme } = useColorScheme();

    // Fetch Profile
    const { data, isLoading, error } = db.useQuery(
        userId ? {
            profiles: {
                $: {
                    where: {
                        "user.id": userId
                    }
                }
            },
            $users: { $: { where: { id: user.id } }, userImage: {} },
        } :
            null
    )
    console.log(data);
    const profile = data?.profiles?.[0];
    const userImage = data?.$users?.[0]?.userImage;
    const [uploading, setUploading] = useState(false);

    const handlePickImage = async () => {
        if (!userId) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets[0].uri) {
                setUploading(true);
                const uri = result.assets[0].uri;
                const timestamp = Date.now();
                const filename = `profile_${userId}_${timestamp}.jpg`;

                // 1. Convert URI to Blob
                const response = await fetch(uri);
                const blob = await response.blob();

                // 2. Upload to InstantDB Storage
                if (db.storage) {
                    const { data: uploadData } = await db.storage.uploadFile(filename, blob);

                    if (uploadData) {
                        // 3. Link to User
                        await db.transact(
                            db.tx.$users[userId].link({ userImage: uploadData.id })
                        );
                        showAlert({ title: "Success", message: "Profile photo updated!", type: 'success' });
                    }
                } else {
                    showAlert({ title: "Configuration Error", message: "Storage is not enabled in this app.", type: 'error' });
                }
            }
        } catch (error) {
            console.error("Image Picker Error:", error);
            showAlert({ title: "Error", message: "Failed to pick or upload image.", type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    if (isLoading) return <LoadingScreen />;

    return (
        <SafeAreaView className='flex-1 bg-gray-50 dark:bg-black'>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View className='px-6 py-4 flex-row justify-between items-center bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800'>
                    <Text className='text-2xl font-bold text-gray-900 dark:text-white'>Profile</Text>
                    <TouchableOpacity onPress={() => { }} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full">
                        <Feather name="settings" size={20} color={colorScheme === 'dark' ? '#fff' : '#374151'} />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View className='m-6 p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 items-center'>
                    <View className="relative">
                        <Image
                            source={{ uri: userImage?.url || user?.imageURL || "https://ui-avatars.com/api/?name=" + (profile?.fullName || "User") + "&background=random" }}
                            className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-700"
                        />
                        <TouchableOpacity
                            onPress={handlePickImage}
                            className="absolute bottom-0 right-0 bg-indigo-600 w-8 h-8 rounded-full items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm"
                        >
                            <Feather name="camera" size={14} color="white" />
                        </TouchableOpacity>
                    </View>

                    <Text className='text-xl font-bold text-gray-900 dark:text-white mt-4'>{profile?.fullName || "Guest User"}</Text>
                    <Text className='text-gray-500 dark:text-gray-400'>{user?.email || "No email linked"}</Text>

                    <View className='flex-row mt-6 gap-4'>
                        <View className='items-center px-4 border-r border-gray-100 dark:border-slate-800'>
                            <Text className='text-lg font-bold text-gray-900 dark:text-white'>4</Text>
                            <Text className='text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold'>Level</Text>
                        </View>
                        <View className='items-center px-4 border-r border-gray-100 dark:border-slate-800'>
                            <Text className='text-lg font-bold text-gray-900 dark:text-white'>12</Text>
                            <Text className='text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold'>Badges</Text>
                        </View>
                        <View className='items-center px-4'>
                            <Text className='text-lg font-bold text-gray-900 dark:text-white'>85%</Text>
                            <Text className='text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold'>Complete</Text>
                        </View>
                    </View>
                </View>

                {/* Personal Info */}
                <View className='px-6 mb-6'>
                    <Text className='text-lg font-bold text-gray-900 dark:text-white mb-4'>Personal Information</Text>
                    <View className='bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 space-y-4'>
                        <InfoRow label="Full Name" value={profile?.fullName || 'Not set'} icon="user" />
                        <InfoRow label="Education" value={profile?.educationLevel || 'Not set'} icon="book" />
                        <InfoRow label="Career Goal" value={profile?.careerGoal || 'Not set'} icon="target" />
                        <InfoRow label="Location" value={`${profile?.district || ''}, ${profile?.state || ''}`} icon="map-pin" />
                    </View>
                </View>

                {/* Settings */}
                <View className='px-6 mb-8'>
                    <Text className='text-lg font-bold text-gray-900 dark:text-white mb-4'>Settings</Text>
                    <View className='bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 space-y-4'>
                        <View className='flex-row justify-between items-center py-2'>
                            <View className='flex-row items-center'>
                                <View className='w-8 h-8 bg-indigo-50 dark:bg-indigo-900 rounded-full items-center justify-center mr-3'>
                                    <Feather name="bell" size={16} color="#4F46E5" />
                                </View>
                                <Text className='font-medium text-gray-700 dark:text-gray-200'>Notifications</Text>
                            </View>
                            <Switch value={true} trackColor={{ true: '#4F46E5' }} />
                        </View>

                        {/* Theme Selection */}
                        <View className='flex-col py-2'>
                            <View className='flex-row items-center mb-3'>
                                <View className='w-8 h-8 bg-indigo-50 dark:bg-indigo-900 rounded-full items-center justify-center mr-3'>
                                    <Feather name="moon" size={16} color="#4F46E5" />
                                </View>
                                <Text className='font-medium text-gray-700 dark:text-gray-200'>Appearance</Text>
                            </View>

                            <View className='flex-row bg-gray-100 dark:bg-slate-800 p-1 rounded-xl'>
                                <TouchableOpacity
                                    onPress={() => setTheme('light')}
                                    className={`flex-1 flex-row items-center justify-center py-2 rounded-lg ${theme === 'light' ? 'bg-white dark:bg-slate-600 shadow-sm' : ''}`}
                                >
                                    <Feather name="sun" size={14} color={theme === 'light' ? '#4F46E5' : '#6B7280'} className='mr-2' />
                                    <Text className={`text-xs font-semibold ${theme === 'light' ? 'text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Light</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setTheme('dark')}
                                    className={`flex-1 flex-row items-center justify-center py-2 rounded-lg ${theme === 'dark' ? 'bg-white dark:bg-indigo-600 shadow-sm' : ''}`}
                                >
                                    <Feather name="moon" size={14} color={theme === 'dark' ? '#4F46E5' : '#6B7280'} className='mr-2' />
                                    <Text className={`text-xs font-semibold ${theme === 'dark' ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400'}`}>Dark</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setTheme('system')}
                                    className={`flex-1 flex-row items-center justify-center py-2 rounded-lg ${theme === 'system' ? 'bg-white dark:bg-slate-600 shadow-sm' : ''}`}
                                >
                                    <Feather name="smartphone" size={14} color={theme === 'system' ? '#4F46E5' : '#6B7280'} className='mr-2' />
                                    <Text className={`text-xs font-semibold ${theme === 'system' ? 'text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>System</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                <View className='px-6'>
                    <Button
                        onPress={() => db.auth.signOut()}
                        title="Log Out"
                        variant="danger"
                        size="lg"
                        className='w-full'
                        icon={<Feather name="log-out" size={20} color="white" />}
                    />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const InfoRow = ({ label, value, icon }: any) => (
    <View className='flex-row items-center py-2 border-b border-gray-50 dark:border-slate-800 last:border-0'>
        <View className='w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-full items-center justify-center mr-4'>
            <Feather name={icon} size={18} color="#6B7280" />
        </View>
        <View>
            <Text className='text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold'>{label}</Text>
            <Text className='text-gray-900 dark:text-white font-medium text-base'>{value}</Text>
        </View>
    </View>
);
