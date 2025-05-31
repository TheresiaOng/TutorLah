import { AuthProvider } from "@/contexts/authContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";
import { Text } from "react-native";
import "./globals.css";

export default function RootLayout() {
  const [fonstLoaded] = useFonts({
    "Asap-Regular": require("../assets/fonts/Asap-Regular.ttf"),
    "Asap-Medium": require("../assets/fonts/Asap-Medium.ttf"),
    "Asap-Semibold": require("../assets/fonts/Asap-SemiBold.ttf"),
    "Asap-Bold": require("../assets/fonts/Asap-Bold.ttf"),
    LuckiestGuy: require("../assets/fonts/LuckiestGuy-Regular.ttf"),
  });

  if (!fonstLoaded) {
    return <Text>Loading fonts...</Text>;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />
    </AuthProvider>
  );
}
