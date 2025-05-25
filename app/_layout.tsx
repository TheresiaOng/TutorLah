import { AuthProvider } from "@/contexts/authContext";
import { Stack } from "expo-router";
import React from "react";
import "./globals.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />
    </AuthProvider>
  );
}
