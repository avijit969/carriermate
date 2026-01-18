import { db } from "@/lib/db";
import { AppSchema } from "@/instant.schema";
import { InstaQLEntity } from "@instantdb/react-native";
import { View, Text, Button, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

type Color = InstaQLEntity<AppSchema, "colors">;

const selectId = "4d39508b-9ee2-48a3-b70d-8192d9c5a059";

function App() {
  const { isLoading, error, data } = db.useQuery({
    colors: {
      $: { where: { id: selectId } },
    },
  });
  if (isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  return <Main color={data.colors[0]} />;
}

function Main(props: { color?: Color }) {
  const { value } = props.color || { value: "lightgray" };

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <View className="items-center mb-10">
        <Text className="text-4xl font-extrabold text-indigo-600 mb-2">CarrierMate</Text>
        <Text className="text-lg text-gray-500 text-center">
          AI-Powered Personalized Learning Path Generator
        </Text>
      </View>

      <Link href="/onboarding" asChild>
        <TouchableOpacity className="bg-indigo-600 px-8 py-4 rounded-full shadow-lg shadow-indigo-200 active:scale-95 transition-all">
          <Text className="text-white text-xl font-bold">Get Started</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

export default App;
