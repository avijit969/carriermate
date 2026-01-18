import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import Button from './Button';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertOptions {
    title: string;
    message: string;
    type?: AlertType;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    onPrimaryPress?: () => void;
    onSecondaryPress?: () => void;
}

interface AlertContextType {
    showAlert: (options: AlertOptions) => void;
    hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [visible, setVisible] = useState(false);
    const [options, setOptions] = useState<AlertOptions>({
        title: '',
        message: '',
        type: 'info',
    });

    const showAlert = (newOptions: AlertOptions) => {
        setOptions({
            type: 'info', // default
            primaryButtonText: 'OK',
            ...newOptions
        });
        setVisible(true);
    };

    const hideAlert = () => {
        setVisible(false);
    };

    const getIcon = () => {
        switch (options.type) {
            case 'success':
                return <Feather name="check-circle" size={48} color="#22C55E" />;
            case 'error':
                return <Feather name="x-circle" size={48} color="#EF4444" />;
            case 'warning':
                return <Feather name="alert-triangle" size={48} color="#F59E0B" />;
            default:
                return <Feather name="info" size={48} color="#3B82F6" />;
        }
    };

    const getPrimaryButtonVariant = () => {
        switch (options.type) {
            case 'success': return 'primary'; // Or custom success color variant if added to Button
            case 'error': return 'danger';
            case 'warning': return 'secondary'; // Or warning variant
            default: return 'primary';
        }
    }

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <Modal transparent visible={visible} animationType="fade" onRequestClose={hideAlert}>
                <View className="flex-1 bg-black/50 justify-center items-center p-6">
                    <Animated.View
                        entering={ZoomIn.duration(300).springify()}
                        className="bg-white w-full max-w-sm rounded-[32px] p-6 items-center shadow-2xl border-b-8 border-gray-200"
                    >
                        <View className="mb-4">
                            {getIcon()}
                        </View>

                        <Text className="text-2xl font-black text-gray-800 text-center mb-2">
                            {options.title}
                        </Text>

                        <Text className="text-gray-500 text-center text-lg mb-8 leading-6">
                            {options.message}
                        </Text>

                        <View className="w-full space-y-3">
                            <Button
                                title={options.primaryButtonText || 'OK'}
                                onPress={() => {
                                    if (options.onPrimaryPress) options.onPrimaryPress();
                                    hideAlert();
                                }}
                                variant={getPrimaryButtonVariant()}
                                size='lg'
                                className="w-full"
                            />

                            {options.secondaryButtonText && (
                                <Button
                                    title={options.secondaryButtonText}
                                    onPress={() => {
                                        if (options.onSecondaryPress) options.onSecondaryPress();
                                        hideAlert();
                                    }}
                                    variant="ghost"
                                    className="w-full mt-2"
                                />
                            )}
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </AlertContext.Provider>
    );
};
