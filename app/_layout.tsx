import Footer from "@/components/footer";
import { AuthProvider, useAuth } from "@/contexts/authContext";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import "./globals.css";

function LayoutWithFooter() {
  const pathname = usePathname();
  const { userDoc } = useAuth();

  const hideFooter =
    pathname === "/" ||
    pathname.startsWith("/loginScreen") ||
    pathname.startsWith("/createListingScreen");

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />
      {!hideFooter && userDoc && <Footer />}
    </View>
  );
}

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
      <LayoutWithFooter />
    </AuthProvider>
  );
}
