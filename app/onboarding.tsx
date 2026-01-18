import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { id, lookup } from '@instantdb/react-native';
import { db } from '@/lib/db';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeOutLeft, Layout, LinearTransition } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Reusable Components
const OptionCard = ({ label, selected, onPress, icon }: any) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={`p-4 rounded-xl border-2 mb-3 flex-row items-center ${selected ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-white'}`}
    >
        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${selected ? 'bg-indigo-600' : 'bg-gray-100'}`}>
            <Feather name={icon || 'circle'} size={20} color={selected ? 'white' : '#6B7280'} />
        </View>
        <Text className={`font-semibold text-lg ${selected ? 'text-indigo-900' : 'text-gray-600'}`}>{label}</Text>
        {selected && <View className="ml-auto"><Feather name="check-circle" size={20} color="#4F46E5" /></View>}
    </TouchableOpacity>
);

const ModernInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default', icon }: any) => (
    <View className="mb-5">
        <Text className="text-gray-700 font-semibold mb-2 ml-1 text-base">{label}</Text>
        <View className="flex-row items-center border border-gray-200 bg-white rounded-2xl px-4 py-4 focus:border-indigo-500 shadow-sm">
            {icon && <Feather name={icon} size={20} color="#9CA3AF" className="mr-3" />}
            <TextInput
                className="flex-1 text-gray-900 font-medium text-base"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#D1D5DB"
                keyboardType={keyboardType}
            />
        </View>
    </View>
);

export default function OnboardingScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const { user } = db.useAuth();
    const userId = user?.id;

    const { data: profileData, isLoading: checkingProfile } = db.useQuery(
        userId ? { profiles: { $: { where: { "user.id": userId } } } } : null
    );

    useEffect(() => {
        if (profileData?.profiles && profileData.profiles.length > 0) {
            router.replace('/(tabs)/home');
        }
    }, [profileData]);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        gender: '',
        educationLevel: '',
        institutionName: '',
        passingYear: '',
        major: '',
        annualFamilyIncome: '',
        category: '',
        state: '',
        district: '',
        careerGoal: '',
        preferredJobRoles: '',
        skills: '',
    });

    const updateForm = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleNext = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (step < 4) {
            setStep(s => s + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (step > 1) {
            setStep(s => s - 1);
        } else {
            router.back();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {

            await db.transact(
                db.tx.profiles[id()].create({
                    ...formData,
                    onboardingStep: 4,
                    preferredJobRoles: formData.preferredJobRoles.split(',').map(s => s.trim()).filter(Boolean),
                    skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                }).link({ user: userId })
            );

            router.replace('/(tabs)/home');
        } catch (error) {
            console.error(error);
            // alert('Failed to save profile. Please try again.'); // Using native alert for now
        } finally {
            setLoading(false);
        }
    };

    // Step Content
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} key="step1">
                        <Text className="text-3xl font-bold text-gray-900 mb-2">Who are you?</Text>
                        <Text className="text-gray-500 mb-8 text-lg">Let's get to know you better to personalize your experience.</Text>

                        <ModernInput icon="user" label="Full Name" value={formData.fullName} onChangeText={(t: string) => updateForm('fullName', t)} placeholder="e.g. Alex Johnson" />
                        <ModernInput icon="calendar" label="Date of Birth" value={formData.dob} onChangeText={(t: string) => updateForm('dob', t)} placeholder="YYYY-MM-DD" />

                        <Text className="text-gray-700 font-semibold mb-2 ml-1 text-base">Gender</Text>
                        <View className="flex-row gap-3">
                            {['Male', 'Female', 'Other'].map((g) => (
                                <TouchableOpacity
                                    key={g}
                                    onPress={() => {
                                        updateForm('gender', g);
                                        Haptics.selectionAsync();
                                    }}
                                    className={`flex-1 py-3 items-center rounded-xl border ${formData.gender === g ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}
                                >
                                    <Text className={`font-medium ${formData.gender === g ? 'text-white' : 'text-gray-600'}`}>{g}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                );
            case 2:
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} key="step2">
                        <Text className="text-3xl font-bold text-gray-900 mb-2">Education</Text>
                        <Text className="text-gray-500 mb-8 text-lg">Your academic background helps us match opportunities.</Text>

                        <ModernInput icon="book" label="Highest Qualification" value={formData.educationLevel} onChangeText={(t: string) => updateForm('educationLevel', t)} placeholder="e.g. B.Tech / B.A." />
                        <ModernInput icon="map-pin" label="Institution Name" value={formData.institutionName} onChangeText={(t: string) => updateForm('institutionName', t)} placeholder="University Name" />
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <ModernInput icon="calendar" label="Passing Year" value={formData.passingYear} onChangeText={(t: string) => updateForm('passingYear', t)} placeholder="2024" keyboardType="numeric" />
                            </View>
                            <View className="flex-[1.5]">
                                <ModernInput icon="award" label="Stream / Major" value={formData.major} onChangeText={(t: string) => updateForm('major', t)} placeholder="Computer Science" />
                            </View>
                        </View>
                    </Animated.View>
                );
            case 3:
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} key="step3">
                        <Text className="text-3xl font-bold text-gray-900 mb-2">Background</Text>
                        <Text className="text-gray-500 mb-8 text-lg">Help us find relevant schemes and scholarships.</Text>

                        <ModernInput icon="dollar-sign" label="Annual Family Income" value={formData.annualFamilyIncome} onChangeText={(t: string) => updateForm('annualFamilyIncome', t)} placeholder="e.g. < 5 Lakhs" />
                        <ModernInput icon="users" label="Category" value={formData.category} onChangeText={(t: string) => updateForm('category', t)} placeholder="General, OBC, SC/ST..." />
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <ModernInput icon="map" label="State" value={formData.state} onChangeText={(t: string) => updateForm('state', t)} placeholder="State" />
                            </View>
                            <View className="flex-1">
                                <ModernInput icon="navigation" label="District" value={formData.district} onChangeText={(t: string) => updateForm('district', t)} placeholder="District" />
                            </View>
                        </View>
                    </Animated.View>
                );
            case 4:
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} key="step4">
                        <Text className="text-3xl font-bold text-gray-900 mb-2">Ambitions</Text>
                        <Text className="text-gray-500 mb-8 text-lg">Where do you want to go?</Text>

                        <ModernInput icon="target" label="Primary Career Goal" value={formData.careerGoal} onChangeText={(t: string) => updateForm('careerGoal', t)} placeholder="Software Engineer" />
                        <ModernInput icon="briefcase" label="Preferred Roles" value={formData.preferredJobRoles} onChangeText={(t: string) => updateForm('preferredJobRoles', t)} placeholder="Developer, Analyst (comma sep)" />
                        <ModernInput icon="cpu" label="Key Skills" value={formData.skills} onChangeText={(t: string) => updateForm('skills', t)} placeholder="React, Python, Java..." />
                    </Animated.View>
                );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar style="dark" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="flex-1 px-6 pt-4">
                    {/* Progress Header */}
                    <View className="flex-row items-center justify-between mb-8">
                        <TouchableOpacity onPress={handleBack} className="w-10 h-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm">
                            <Feather name="arrow-left" size={20} color="#374151" />
                        </TouchableOpacity>
                        <View className="flex-1 h-2 bg-gray-200 mx-4 rounded-full overflow-hidden">
                            <Animated.View
                                style={{ width: `${(step / 4) * 100}%` }}
                                layout={LinearTransition.springify()}
                                className="h-full bg-indigo-600 rounded-full"
                            />
                        </View>
                        <Text className="text-gray-500 font-bold">{step}/4</Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                        {renderStep()}
                    </ScrollView>

                    {/* Bottom Action Bar */}
                    <View className="absolute bottom-6 left-6 right-6">
                        <TouchableOpacity
                            onPress={handleNext}
                            activeOpacity={0.8}
                            className="bg-indigo-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-indigo-300 flex-row"
                        >
                            <Text className="text-white font-bold text-lg mr-2">{step === 4 ? (loading ? 'Finishing...' : 'Complete Profile') : 'Continue'}</Text>
                            {!loading && <Feather name="arrow-right" size={20} color="white" />}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
