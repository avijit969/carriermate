import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { db } from '@/lib/db';
import Button from '@/components/ui/Button';

import { useAlert } from '@/components/ui/CustomAlert';

export default function LoginScreen() {
    const router = useRouter();
    const { showAlert } = useAlert();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [sentEmail, setSentEmail] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (!sentEmail) {
            // Send Magic Code
            if (!email) {
                showAlert({ title: "Error", message: "Please enter your email address.", type: 'error' });
                return;
            }
            setLoading(true);
            try {
                await db.auth.sendMagicCode({ email });
                setSentEmail(true);
                showAlert({ title: "Success", message: "Magic code sent! Please check your email.", type: 'success' });
            } catch (error: any) {
                console.error(error);
                showAlert({ title: "Error", message: error.body?.message || error.message || "Failed to send code.", type: 'error' });
            } finally {
                setLoading(false);
            }
        } else {
            // Verify Magic Code
            if (!code) {
                showAlert({ title: "Error", message: "Please enter the code sent to your email.", type: 'error' });
                return;
            }
            setLoading(true);
            try {
                await db.auth.signInWithMagicCode({ email, code });
                // Successful login
                router.replace('/onboarding');
            } catch (error: any) {
                console.error(error);
                showAlert({ title: "Error", message: error.body?.message || error.message || "Invalid code. Please try again.", type: 'error' });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' }}
                className="absolute w-full h-full opacity-15"
                blurRadius={10}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 px-8 justify-center"
            >
                <Animated.View entering={FadeInUp.delay(200).springify()}>
                    <View className="items-center mb-10">
                        <View className="w-20 h-20 bg-indigo-600 rounded-3xl items-center justify-center -rotate-6 shadow-xl shadow-indigo-300 mb-6">
                            <Feather name="anchor" size={40} color="white" />
                        </View>
                        <Text className="text-4xl font-bold text-gray-900 tracking-tight text-center">
                            {sentEmail ? 'Check your mail' : 'Welcome Back'}
                        </Text>
                        <Text className="text-gray-500 mt-2 text-center text-lg">
                            {sentEmail ? `We've sent a magic code to \n${email}` : 'Sign in to continue your journey'}
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400).springify()} className="space-y-6">
                    <View>
                        <Text className="text-gray-700 font-medium mb-2 ml-1">Email Address</Text>
                        <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-2xl px-4 py-4 focus:border-indigo-500 focus:bg-white transition-all">
                            <Feather name="mail" size={20} color="#6B7280" />
                            <TextInput
                                className="flex-1 ml-3 text-gray-900 text-lg"
                                placeholder="name@example.com"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={!sentEmail}
                            />
                            {sentEmail && (
                                <TouchableOpacity onPress={() => setSentEmail(false)}>
                                    <Text className="text-indigo-600 font-semibold ml-2">Edit</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {sentEmail && (
                        <Animated.View entering={FadeInDown.springify()}>
                            <Text className="text-gray-700 font-medium mb-2 ml-1 mt-2">Magic Code</Text>
                            <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-2xl px-4 py-4 focus:border-indigo-500 focus:bg-white transition-all">
                                <Feather name="key" size={20} color="#6B7280" />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-900 text-lg"
                                    placeholder="123456"
                                    placeholderTextColor="#9CA3AF"
                                    value={code}
                                    onChangeText={setCode}
                                    keyboardType="number-pad"
                                    autoFocus
                                />
                            </View>
                        </Animated.View>
                    )}

                    <Button
                        onPress={handleLogin}
                        title={loading ? 'Processing...' : (sentEmail ? 'Verify Code' : 'Send Code')}
                        variant="primary"
                        size="md"
                        className="w-full mt-6"
                    />

                    {!sentEmail && (
                        <View className="flex-row justify-center mt-6">
                            <Text className="text-gray-500">Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/onboarding')}>
                                <Text className="text-indigo-600 font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>

                {/* Social Login Divider (for aesthetics) */}
                {!sentEmail && (
                    <Animated.View entering={FadeInDown.delay(600).springify()} className="mt-12">
                        <View className="flex-row items-center mb-6">
                            <View className="flex-1 h-[1px] bg-gray-200" />
                            <Text className="mx-4 text-gray-400">Or continue with</Text>
                            <View className="flex-1 h-[1px] bg-gray-200" />
                        </View>

                        <View className="flex-row gap-4 justify-center">
                            <TouchableOpacity className="w-16 h-16 bg-white border border-gray-100 rounded-2xl items-center justify-center shadow-sm">
                                <Image
                                    source={{ uri: 'https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-suite-everything-you-need-know-about-google-newest-0.png' }}
                                    className="w-8 h-8"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity className="w-16 h-16 bg-white border border-gray-100 rounded-2xl items-center justify-center shadow-sm">
                                <Feather name="github" size={24} color="black" />
                            </TouchableOpacity>
                            <TouchableOpacity className="w-16 h-16 bg-white border border-gray-100 rounded-2xl items-center justify-center shadow-sm">
                                <Feather name="twitter" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}

            </KeyboardAvoidingView>
        </View>
    );
}