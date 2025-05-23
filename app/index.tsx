import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text className="text-6xl color-primary font-bold">Landing</Text>
      <View className="flex flex-row gap-4 items-center">
        <TouchableOpacity
          className="bg-primary p-4 rounded-lg mt-4"
          onPress={() => router.push("/loginScreens/login")}
        >
          <Text>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-primary p-4 rounded-lg mt-4"
          onPress={() => router.push("/loginScreens/signup")}
        >
          <Text>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
