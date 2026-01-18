import React from 'react';
import { Text, Pressable, View, ActivityIndicator, Animated, GestureResponderEvent } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
    title: string;
    onPress: (event: GestureResponderEvent) => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    className?: string;
    textClassName?: string;
}

const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    className = '',
    textClassName = '',
}: ButtonProps) => {
    const animatedValue = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(animatedValue, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 200,
        }).start();
        if (!disabled && !loading) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handlePressOut = () => {
        Animated.spring(animatedValue, {
            toValue: 1,
            useNativeDriver: true,
            speed: 200,
        }).start();
    };

    // Styles based on variant
    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    container: 'bg-indigo-500 border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1',
                    text: 'text-white',
                };
            case 'secondary':
                return {
                    container: 'bg-white border-2 border-gray-200 border-b-4 border-b-gray-300 active:border-b-2 active:translate-y-0.5',
                    text: 'text-gray-700',
                };
            case 'outline':
                return {
                    container: 'bg-transparent border-2 border-indigo-500 active:bg-indigo-50',
                    text: 'text-indigo-500',
                };
            case 'danger':
                return {
                    container: 'bg-red-500 border-b-4 border-red-700 active:border-b-0 active:translate-y-1',
                    text: 'text-white',
                };
            case 'ghost':
                return {
                    container: 'bg-transparent',
                    text: 'text-gray-600',
                };
            default:
                return {
                    container: 'bg-indigo-500 border-b-4 border-indigo-700',
                    text: 'text-white',
                };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return 'px-4 py-2';
            case 'lg':
                return 'px-8 py-4';
            default:
                return 'px-6 py-3';
        }
    };

    const styles = getVariantStyles();

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            className={`rounded-2xl flex-row items-center justify-center ${styles.container} ${getSizeStyles()} ${disabled ? 'opacity-50' : ''} ${className}`}
            style={({ pressed }) => [
                // Platform.select({
                //     ios: {  },
                //     android: { elevation: pressed ? 0 : 2 }
                // })
            ]}
        >
            <Animated.View style={{ transform: [{ scale: animatedValue }] }} className="flex-row items-center">
                {loading ? (
                    <ActivityIndicator color={variant === 'outline' || variant === 'secondary' ? '#4F46E5' : 'white'} className="mr-2" />
                ) : icon ? (
                    <View className="mr-2">{icon}</View>
                ) : null}

                <Text className={`font-bold text-base ${styles.text} ${textClassName}`}>
                    {loading ? 'Loading...' : title}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

export default Button;
