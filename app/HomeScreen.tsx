import { router } from "expo-router";
import { signOut } from "firebase/auth";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { auth } from "../firebase";

const HomeScreen = () => {
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-6xl color-primary font-bold">Home Screen</Text>
      <Text>You succesfully log in!</Text>
      <TouchableOpacity
        className="bg-primary p-4 rounded-lg mt-4"
        onPress={handleLogout}
      >
        <Text className="text-white text-lg">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
