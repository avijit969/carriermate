import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { id } from '@instantdb/react-native';
import { db } from '@/lib/db';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Button from '@/components/ui/Button';
import { useAlert } from '@/components/ui/CustomAlert';
import LoadingScreen from '@/components/LoadingScreen';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

// Reusable Components
const OptionCard = ({ label, selected, onPress, icon }: any) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={`p-5 rounded-2xl border-2 mb-4 flex-row items-center transition-all shadow-sm ${selected ? 'border-b-4 border-indigo-600 bg-indigo-50 shadow-indigo-100' : 'border-gray-100 bg-white border-b-4'}`}
    >
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${selected ? 'bg-indigo-600' : 'bg-gray-100'}`}>
            <Feather name={icon || 'circle'} size={22} color={selected ? 'white' : '#6B7280'} />
        </View>
        <Text className={`font-bold text-lg ${selected ? 'text-indigo-900' : 'text-gray-600'}`}>{label}</Text>
        {selected && <View className="ml-auto bg-indigo-100 p-1 rounded-full"><Feather name="check" size={16} color="#4F46E5" /></View>}
    </TouchableOpacity>
);

const ModernInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default', icon, multiline }: any) => (
    <View className="mb-6">
        <Text className="text-gray-700 font-bold mb-2 ml-1 text-base tracking-wide">{label}</Text>
        <View className={`flex-row items-center border border-gray-200 bg-white rounded-2xl px-4 ${multiline ? 'py-3' : 'py-4'} focus:border-indigo-500 shadow-sm focus:shadow-md transition-all`}>
            {icon && <Feather name={icon} size={20} color="#9CA3AF" className="mr-3" />}
            <TextInput
                className="flex-1 text-gray-900 font-medium text-base h-full"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#D1D5DB"
                keyboardType={keyboardType}
                multiline={multiline}
                textAlignVertical={multiline ? 'top' : 'center'}
            />
        </View>
    </View>
);

const DateInput = ({ label, value, onChange, icon }: any) => {
    const [show, setShow] = useState(false);
    const dateValue = value ? new Date(value) : new Date();

    const handleChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShow(false);
        }
        if (selectedDate) {
            onChange(selectedDate.toISOString().split('T')[0]);
        }
    };

    return (
        <View className="mb-6">
            <Text className="text-gray-700 font-bold mb-2 ml-1 text-base tracking-wide">{label}</Text>
            <TouchableOpacity
                onPress={() => setShow(!show)}
                activeOpacity={0.7}
                className={`flex-row items-center border border-gray-200 bg-white rounded-2xl px-4 py-4 shadow-sm ${show ? 'border-indigo-500 ring-2 ring-indigo-100' : ''}`} // Added ring effect logic if needed, simplify for now
            >
                <Feather name={icon || 'calendar'} size={20} color="#9CA3AF" className="mr-3" />
                <Text className={`flex-1 font-medium text-base ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                    {value || "Select Date (YYYY-MM-DD)"}
                </Text>
                <Feather name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {show && (
                <View className={Platform.OS === 'ios' ? 'mt-2 bg-white rounded-xl p-2 border border-gray-100 shadow-sm' : ''}>
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={dateValue}
                        mode="date"
                        is24Hour={true}
                        display={Platform.OS === 'ios' ? 'inline' : 'default'} // Inline for iOS looks modern
                        onChange={handleChange}
                        accentColor="#4F46E5"
                        textColor="#1F2937"
                    />
                    {Platform.OS === 'ios' && (
                        <TouchableOpacity onPress={() => setShow(false)} className="items-center py-3 border-t border-gray-100 mt-2">
                            <Text className="text-indigo-600 font-bold">Done</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

export default function OnboardingScreen() {
    const { showAlert } = useAlert();
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
            if (step === 1) {
                if (!formData.fullName) {
                    showAlert({ title: 'Missing Info', message: 'Please enter your full name.', type: 'warning' });
                    return;
                }
                if (!formData.dob) {
                    showAlert({ title: 'Missing Info', message: 'Please select your Date of Birth.', type: 'warning' });
                    return;
                }
                if (!formData.gender) {
                    showAlert({ title: 'Missing Info', message: 'Please select your gender.', type: 'warning' });
                    return;
                }
            }
            if (step === 4 && !formData.careerGoal) {
                showAlert({ title: 'Ambition Missing', message: 'Please tell us your primary career goal.', type: 'warning' });
                return;
            }
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
            showAlert({ title: 'Error', message: 'Failed to create profile. Please try again.', type: 'error' });
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
                        <View className="mb-8">
                            <Text className="text-4xl font-extrabold text-gray-900 mb-2">Introduction</Text>
                            <Text className="text-gray-500 text-lg leading-6">Let's start with the basics to setup your profile.</Text>
                        </View>

                        <ModernInput icon="user" label="Full Name" value={formData.fullName} onChangeText={(t: string) => updateForm('fullName', t)} placeholder="e.g. Alex Johnson" />

                        <DateInput icon="calendar" label="Date of Birth" value={formData.dob} onChange={(t: string) => updateForm('dob', t)} />

                        <Text className="text-gray-700 font-bold mb-3 ml-1 text-base tracking-wide">Gender</Text>
                        <View className="flex-row gap-3 mb-4">
                            {['Male', 'Female', 'Other'].map((g) => (
                                <TouchableOpacity
                                    key={g}
                                    onPress={() => {
                                        updateForm('gender', g);
                                        Haptics.selectionAsync();
                                    }}
                                    activeOpacity={0.8}
                                    className={`flex-1 py-4 items-center rounded-2xl border-b-4 transition-all shadow-sm ${formData.gender === g ? 'bg-indigo-600 border-indigo-800 shadow-indigo-200' : 'bg-white border-gray-200 shadow-gray-100'}`}
                                >
                                    <View className="flex-row items-center gap-2">
                                        {formData.gender === g && <Feather name="check" size={16} color="white" />}
                                        <Text className={`font-bold text-base ${formData.gender === g ? 'text-white' : 'text-gray-600'}`}>{g}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                );
            case 2:
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} key="step2">
                        <View className="mb-8">
                            <Text className="text-4xl font-extrabold text-gray-900 mb-2">Education</Text>
                            <Text className="text-gray-500 text-lg leading-6">Your academic background helps us match opportunities.</Text>
                        </View>

                        <ModernInput icon="book" label="Highest Qualification" value={formData.educationLevel} onChangeText={(t: string) => updateForm('educationLevel', t)} placeholder="e.g. B.Tech, B.A., 12th Pass" />
                        <ModernInput icon="map-pin" label="Institution Name" value={formData.institutionName} onChangeText={(t: string) => updateForm('institutionName', t)} placeholder="University or School Name" />
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <ModernInput icon="calendar" label="Passing Year" value={formData.passingYear} onChangeText={(t: string) => updateForm('passingYear', t)} placeholder="2024" keyboardType="numeric" />
                            </View>
                            <View className="flex-[1.5]">
                                <ModernInput icon="award" label="Stream / Major" value={formData.major} onChangeText={(t: string) => updateForm('major', t)} placeholder="Science, Arts..." />
                            </View>
                        </View>
                    </Animated.View>
                );
            case 3:
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} key="step3">
                        <View className="mb-8">
                            <Text className="text-4xl font-extrabold text-gray-900 mb-2">Background</Text>
                            <Text className="text-gray-500 text-lg leading-6">Help us find relevant schemes and scholarships.</Text>
                        </View>

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
                        <View className="mb-8">
                            <Text className="text-4xl font-extrabold text-gray-900 mb-2">Ambitions</Text>
                            <Text className="text-gray-500 text-lg leading-6">Where do you want to go?</Text>
                        </View>

                        <ModernInput icon="target" label="Primary Career Goal" value={formData.careerGoal} onChangeText={(t: string) => updateForm('careerGoal', t)} placeholder="e.g. Software Engineer, UPSC" />
                        <ModernInput icon="briefcase" label="Preferred Roles" value={formData.preferredJobRoles} onChangeText={(t: string) => updateForm('preferredJobRoles', t)} placeholder="Developer, Analyst (comma sep)" />
                        <ModernInput icon="cpu" label="Key Skills" value={formData.skills} onChangeText={(t: string) => updateForm('skills', t)} placeholder="React, Python, Java..." multiline />
                    </Animated.View>
                );
        }
    };
    if (checkingProfile) {
        return (
            <LoadingScreen />
        )
    }
    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <StatusBar style="dark" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="flex-1 px-6 pt-4">
                    {/* Progress Header */}
                    <View className="flex-row items-center justify-between mb-8">
                        <TouchableOpacity onPress={handleBack} className="w-10 h-10 items-center justify-center bg-white rounded-full border border-gray-200 shadow-sm">
                            <Feather name="arrow-left" size={20} color="#1F2937" />
                        </TouchableOpacity>
                        <View className="flex-1 h-3 bg-gray-200 mx-5 rounded-full overflow-hidden">
                            <Animated.View
                                style={{ width: `${(step / 4) * 100}%` }}
                                layout={LinearTransition.springify()}
                                className="h-full bg-indigo-600 rounded-full"
                            />
                        </View>
                        <Text className="text-indigo-900 font-extrabold text-lg">{step}/4</Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
                        {renderStep()}
                    </ScrollView>

                    {/* Bottom Action Bar */}
                    <View className="absolute bottom-6 left-6 right-6 flex-row gap-4 bg-transparent">
                        {step > 1 && (
                            <View className="flex-1">
                                <Button
                                    onPress={handleBack}
                                    title="Back"
                                    variant="secondary"
                                    size="lg"
                                    className="w-full shadow-sm"
                                />
                            </View>
                        )}
                        <View className="flex-1">
                            <Button
                                onPress={handleNext}
                                title={step === 4 ? (loading ? 'Finishing...' : 'Complete') : 'Continue'}
                                variant="primary"
                                size="lg"
                                loading={loading}
                                icon={!loading && step < 4 ? <Feather name="arrow-right" size={20} color="white" /> : undefined}
                                className="w-full shadow-lg shadow-indigo-300"
                            />
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
