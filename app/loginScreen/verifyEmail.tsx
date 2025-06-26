import { auth, db } from "@/firebase";
import Constants from "expo-constants";
import { router } from "expo-router";
import { sendEmailVerification } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const secret = Constants.expoConfig?.extra?.streamSecretKey;

const VerifyEmail = () => {
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (auth.currentUser && cooldown === 0) {
      try {
        await sendEmailVerification(auth.currentUser);
        setCooldown(60);
      } catch (error) {
        console.error("Error sending verification email again:", error);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          setVerified(true);
          setChecking(true);

          const userDocRef = doc(db, "users", user.uid);
          await updateDoc(userDocRef, { verified: true });

          const docSnap = await getDoc(userDocRef);
          const userData = docSnap.exists() ? docSnap.data() : null;

          try {
            const streamUser = await fetch(
              "https://ynikykgyystdyitckguc.supabase.co/functions/v1/create-stream-user",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${secret}`,
                },
                body: JSON.stringify({
                  id: userData?.userId,
                  name: userData?.name,
                  role: userData?.role,
                }),
              }
            );
            const result = await streamUser.json();
            console.log("Reseponse from Stream API:", result);

            if (!streamUser.ok) throw new Error("Failed to create Stream user");

            console.log("Stream user created:", result);
            clearInterval(interval);
            router.replace("/loginScreen/login");
          } catch (err) {
            console.log("Stream user creation error:", err);
            Alert.alert("Unexpected error occurred. Please try again later.");
          }
        }
      }
    }, 3000); // check every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <View className={"flex-1 bg-primaryOrange"}>
      {/* Header section */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-16 mb-10 w-10 h-10 left-5 items-center justify-center"
      >
        <Image
          className="w-10"
          resizeMode="contain"
          source={require("../../assets/images/arrowBack.png")}
        />
      </TouchableOpacity>

      <View className="flex-1 bg-white pt-8 items-center rounded-t-3xl">
        {checking ? (
          <>
            <Text className="text-lg mb-4 font-asap-medium">
              Verifying email...
            </Text>
            <ActivityIndicator size="large" />
          </>
        ) : verified ? (
          <Text className="text-lg font-asap-medium">
            Email verified! Redirecting...
          </Text>
        ) : (
          <>
            <Text className="text-sm font-asap-semibold">
              Please verify your email by clicking the link in your inbox.
            </Text>
            <Text className="text-sm font-asap-medium">
              Please also check your spam folder.
            </Text>
            <Text className="text-sm font-asap-medium">
              Once verified, You can login with the same email.
            </Text>
            <Text className="text-sm mt-12 font-asap-medium">
              Did not get the email?
            </Text>
            <TouchableOpacity
              className={`h-14 w-64 mt-2 rounded-lg items-center justify-center ${
                cooldown > 0 ? "bg-lightGray" : " bg-secondaryBlue"
              }`}
              disabled={cooldown > 0}
              onPress={handleResendEmail}
            >
              <Text
                className={`font-asap-bold text-lg ${
                  cooldown > 0 ? "text-gray" : " text-darkBlue"
                }`}
              >
                {cooldown > 0 ? `Next resend in: ${cooldown}` : "Resend"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default VerifyEmail;
