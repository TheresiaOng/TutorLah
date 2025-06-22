import { ChatWrapper } from "@/components/chatWrapper";
import Footer from "@/components/footer";
import { AuthProvider, useAuth } from "@/contexts/AuthProvider";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./globals.css";

function LayoutWithFooter() {
  const pathname = usePathname();
  const { userDoc } = useAuth();

  const hideFooter =
    pathname === "/" ||
    pathname.startsWith("/loginScreen") ||
    pathname.startsWith("/createListingScreen") ||
    (pathname.startsWith("/chatScreen/") &&
      pathname !== "/chatScreen/channelListScreen") ||
    pathname == "/paymentCreation";

  return (
    <View className="flex-1">
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
    <SafeAreaProvider>
      <GestureHandlerRootView className="flex-1">
        <AuthProvider>
          <ChatWrapper>
            <LayoutWithFooter />
          </ChatWrapper>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
