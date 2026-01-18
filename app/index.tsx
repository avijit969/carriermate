import { View, Text, TouchableOpacity } from "react-native";
import Button from "@/components/ui/Button";
import { useRouter } from "expo-router";
function Main() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black p-6">
      <View className="items-center mb-10">
        <Text className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-2">CarrierMate</Text>
        <Text className="text-lg text-gray-500 dark:text-gray-400 text-center">
          AI-Powered Personalized Learning Path Generator
        </Text>
      </View>
      <Button
        title="Get Started"
        onPress={() => {
          router.push('/login');
        }}
        variant="primary"
        className="w-full"
      />
    </View>
  );
}

export default Main;
