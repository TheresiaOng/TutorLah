import Footer from "@/components/footer";
import { ChatWrapper } from "@/components/streamWrapper";
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

  // Hide footer from all of these screens
  const hideFooter =
    pathname === "/" ||
    pathname.startsWith("/loginScreen") ||
    pathname.startsWith("/createListingScreen") ||
    (pathname.startsWith("/chatScreen/") &&
      pathname !== "/chatScreen/chatListScreen") ||
    pathname == "/lessonCreation" ||
    pathname == "/createReview" ||
    pathname == "/comingSoon" ||
    pathname.startsWith("/videoScreen") ||
    pathname.startsWith("/editProfile") ||
    pathname.startsWith("/allListingsScreen") ||
    pathname.startsWith("/allReviewsScreen") ||
    pathname.startsWith("/allFollowingsScreen");

  return (
    <View className="flex-1">
      <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />
      {!hideFooter && userDoc && <Footer />}
    </View>
  );
}

function ConditionalWrapper() {
  const { userDoc } = useAuth();

  if (!userDoc) {
    return <LayoutWithFooter />;
  }

  // Only wraps the chatWrapper if userDoc exists (user logged in)
  return (
    <ChatWrapper>
      <LayoutWithFooter />
    </ChatWrapper>
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
          <ConditionalWrapper />
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
