import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { id } from '@instantdb/react-native';
import { db } from '@/lib/db';

export default function OnboardingScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Personal
        fullName: '',
        dob: '',
        gender: '',

        // Step 2: Education
        educationLevel: '',
        institutionName: '',
        passingYear: '',
        major: '',

        // Step 3: Socio-Economic
        annualFamilyIncome: '',
        category: '',
        state: '',
        district: '',

        // Step 4: Aspirations
        careerGoal: '',
        preferredJobRoles: '', // Comma separated for input, will convert to array
        skills: '', // Comma separated for input
    });

    const updateForm = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const profileId = id();
            const userId = id(); // In a real app, this would come from auth

            await db.transact(
                db.tx.profiles[profileId].update({
                    onboardingStep: 4,
                    fullName: formData.fullName,
                    dob: formData.dob,
                    gender: formData.gender,

                    educationLevel: formData.educationLevel,
                    institutionName: formData.institutionName,
                    passingYear: formData.passingYear,
                    major: formData.major,

                    annualFamilyIncome: formData.annualFamilyIncome,
                    category: formData.category,
                    state: formData.state,
                    district: formData.district,

                    careerGoal: formData.careerGoal,
                    preferredJobRoles: formData.preferredJobRoles.split(',').map(s => s.trim()).filter(Boolean),
                    skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),

                    // Link to user (mocked for now since auth isn't fully set up with a logged in user)
                    // valid user link requires a user entity. For now creating a profile is enough.
                })
            );

            // Navigate to success or home
            router.replace('/');
        } catch (error) {
            console.error(error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const StepIndicator = () => (
        <View className="flex-row justify-center items-center mb-8 gap-2">
            {[1, 2, 3, 4].map((s) => (
                <View key={s} className="flex-row items-center">
                    <View
                        className={`w-8 h-8 rounded-full items-center justify-center border-2 
              ${step >= s ? 'bg-indigo-600 border-indigo-600' : 'bg-transparent border-gray-300'}`}
                    >
                        <Text className={`${step >= s ? 'text-white' : 'text-gray-400'} font-bold`}>{s}</Text>
                    </View>
                    {s < 4 && (
                        <View className={`w-8 h-1 mx-1 ${step > s ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                    )}
                </View>
            ))}
        </View>
    );

    const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }: any) => (
        <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1">{label}</Text>
            <TextInput
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:border-indigo-500 text-gray-900"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                keyboardType={keyboardType}
            />
        </View>
    );

    const Step1 = () => (
        <View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Personal Details</Text>
            <Text className="text-gray-500 mb-6">Let's start with the basics.</Text>

            <InputField label="Full Name" value={formData.fullName} onChangeText={(t: string) => updateForm('fullName', t)} placeholder="e.g. John Doe" />
            <InputField label="Date of Birth" value={formData.dob} onChangeText={(t: string) => updateForm('dob', t)} placeholder="YYYY-MM-DD" />
            <InputField label="Gender" value={formData.gender} onChangeText={(t: string) => updateForm('gender', t)} placeholder="e.g. Male/Female/Other" />
        </View>
    );

    const Step2 = () => (
        <View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Education History</Text>
            <Text className="text-gray-500 mb-6">Tell us about your academic background.</Text>

            <InputField label="Highest Qualification" value={formData.educationLevel} onChangeText={(t: string) => updateForm('educationLevel', t)} placeholder="e.g. Bachelor's Degree" />
            <InputField label="Institution Name" value={formData.institutionName} onChangeText={(t: string) => updateForm('institutionName', t)} placeholder="e.g. University of Technology" />
            <InputField label="Passing Year" value={formData.passingYear} onChangeText={(t: string) => updateForm('passingYear', t)} placeholder="e.g. 2024" keyboardType="numeric" />
            <InputField label="Major / Stream" value={formData.major} onChangeText={(t: string) => updateForm('major', t)} placeholder="e.g. Computer Science" />
        </View>
    );

    const Step3 = () => (
        <View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Socio-Economic Info</Text>
            <Text className="text-gray-500 mb-6">This helps us tailor opportunities for you.</Text>

            <InputField label="Annual Family Income" value={formData.annualFamilyIncome} onChangeText={(t: string) => updateForm('annualFamilyIncome', t)} placeholder="e.g. < 5 Lakhs" />
            <InputField label="Category" value={formData.category} onChangeText={(t: string) => updateForm('category', t)} placeholder="e.g. General, OBC, SC/ST" />
            <InputField label="State" value={formData.state} onChangeText={(t: string) => updateForm('state', t)} placeholder="e.g. Karnataka" />
            <InputField label="District" value={formData.district} onChangeText={(t: string) => updateForm('district', t)} placeholder="e.g. Bangalore Urban" />
        </View>
    );

    const Step4 = () => (
        <View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Career Aspirations</Text>
            <Text className="text-gray-500 mb-6">What are your goals?</Text>

            <InputField label="Primary Career Goal" value={formData.careerGoal} onChangeText={(t: string) => updateForm('careerGoal', t)} placeholder="e.g. Software Engineer" />
            <InputField label="Preferred Job Roles (comma separated)" value={formData.preferredJobRoles} onChangeText={(t: string) => updateForm('preferredJobRoles', t)} placeholder="e.g. Developer, Analyst" />
            <InputField label="Key Skills (comma separated)" value={formData.skills} onChangeText={(t: string) => updateForm('skills', t)} placeholder="e.g. React, Node.js, Python" />
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
                    <StepIndicator />

                    <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                        {step === 1 && <Step1 />}
                        {step === 2 && <Step2 />}
                        {step === 3 && <Step3 />}
                        {step === 4 && <Step4 />}
                    </View>

                    <View className="flex-row justify-between">
                        <TouchableOpacity
                            onPress={() => step > 1 ? setStep(step - 1) : router.back()}
                            className="px-6 py-3 rounded-xl bg-gray-200"
                        >
                            <Text className="font-semibold text-gray-700">{step === 1 ? 'Cancel' : 'Back'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => step < 4 ? setStep(step + 1) : handleSubmit()}
                            className="px-6 py-3 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-200"
                            disabled={loading}
                        >
                            <Text className="font-semibold text-white">{loading ? 'Saving...' : (step === 4 ? 'Finish' : 'Next')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
