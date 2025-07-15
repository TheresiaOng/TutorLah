import CustomButton from "@/components/customButton";
import { useAuth } from "@/contexts/AuthProvider";
import { auth, db } from "@/firebase";
import Constants from "expo-constants";
import { router, useLocalSearchParams } from "expo-router";
import {
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
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

const secret = Constants.expoConfig?.extra?.supabaseApiKey;

const VerifyEmail = () => {
  const { email, password } = useLocalSearchParams();
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [loading, setLoading] = useState(false);
  const { setUserDoc } = useAuth();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    // Reduce cooldown time by one per second
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Email resend only available after every 60 seconds
  const handleResendEmail = async () => {
    if (auth.currentUser && cooldown === 0) {
      setLoading(true);
      try {
        await sendEmailVerification(auth.currentUser);
        Alert.alert(
          "Email sent!",
          "A verification link has been sent to your email. Please verify to continue."
        );
        setCooldown(60);
        setLoading(false);
      } catch (error) {
        Alert.alert(
          "Error",
          "There seems to be a problem, please try again in a moment."
        );
        setLoading(false);
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
          await updateDoc(userDocRef, { verified: true }); // Update verified state in document

          const docSnap = await getDoc(userDocRef);
          const userData = docSnap.exists() ? docSnap.data() : null;

          try {
            // Connect user to stream
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

            // Sign user in with their email and password
            const userCredential = await signInWithEmailAndPassword(
              auth,
              typeof email === "string" ? email : email?.[0] ?? "",
              typeof password === "string" ? password : password?.[0] ?? ""
            );

            console.log("User Logged in: ", userCredential);

            const unsubscribe = onAuthStateChanged(auth, async (newUser) => {
              if (newUser && newUser.emailVerified) {
                const userDocRef = doc(db, "users", newUser.uid);
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                  setUserDoc(docSnap.data());
                  unsubscribe();
                  router.replace("/loginScreen/personalQuestions");
                } else {
                  console.log("❌ No Firestore doc found for user");
                  Alert.alert("Error", "User profile data not found.");
                }
              }
            });
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
        disabled={loading}
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
            <View className="w-64 mt-3">
              <CustomButton
                title={cooldown > 0 ? `Next resend in: ${cooldown}` : "Resend"}
                role="tutor"
                onPress={handleResendEmail}
                active={cooldown == 0}
                loading={loading}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default VerifyEmail;
