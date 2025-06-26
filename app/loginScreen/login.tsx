import { router } from "expo-router";
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../firebase";
import errorhandling from "./errorhandling";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidden, setHidden] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const loginEmailPassword = async () => {
    if (email != "" && password != "") {
      try {
        // Sign in with email and password
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        if (auth.currentUser && !auth.currentUser.emailVerified) {
          sendEmailVerification(userCredential.user);
          Alert.alert(
            "Verify Email",
            "Please verify your email first before logging in"
          );
          router.push("./verifyEmail");
        } else {
          console.log(userCredential.user);
          router.push("/homeScreen/home");
        }
      } catch (error: any) {
        console.log(error);
        const errorMessage = errorhandling(error);
        setErrorMsg(errorMessage ?? "");
        console.log(errorMessage);
      }
    } else {
      setErrorMsg("Please enter email and password.");
    }
  };

  return (
    <View className={"flex-1 bg-primaryOrange"}>
      {/* Header section */}
      <TouchableOpacity
        onPress={() => router.push("/")}
        className="mt-16 mb-10 w-10 h-10 left-5 items-center justify-center"
      >
        <Image
          className="w-10"
          resizeMode="contain"
          source={require("../../assets/images/arrowBack.png")}
        />
      </TouchableOpacity>

      <View className="flex-1 bg-white pt-8 items-center rounded-t-3xl">
        {/* Email and Password Input Section */}
        {errorMsg != "" && (
          <Text className="text-sm font-asap-regular mb-4 text-red-500">
            {errorMsg}
          </Text>
        )}
        <View className="justify-center w-full px-6 items-start">
          <Text
            className={
              "text-sm pl-4 font-medium font-asap-medium text-darkPrimaryOrange"
            }
          >
            Email Address
          </Text>
          <TextInput
            className="border-2 border-gray font-asap-regular rounded-full p-2 mb-4 w-full"
            placeholderTextColor={"#000"}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <Text
            className={
              "text-sm pl-4 font-medium font-asap-medium text-darkPrimaryOrange"
            }
          >
            Password
          </Text>
          <View className="flex flex-row items-center w-full">
            <TextInput
              className="border-2 border-gray p-2 font-asap-regular rounded-full mb-4 flex-1"
              secureTextEntry={hidden}
              placeholderTextColor={"#000"}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            {/* toggle password visibility */}
            <TouchableOpacity
              onPress={() => setHidden(!hidden)}
              className="rounded-full -inset-y-2 items-center justify-center min-w-12 h-12"
            >
              <Image
                className="w-7"
                resizeMode="contain"
                source={
                  hidden
                    ? require("../../assets/images/eye.png")
                    : require("../../assets/images/eyeOff.png")
                }
              />
            </TouchableOpacity>
          </View>
          {/* Log In button */}
          <TouchableOpacity
            onPress={loginEmailPassword}
            className={
              "bg-secondaryOrange w-full mt-4 items-center p-3 rounded-xl"
            }
          >
            <Text className={"text-darkBrown font-asap-bold"}>Log In</Text>
          </TouchableOpacity>
          <View className="flex-row w-full justify-center gap-1">
            <Text className="font-asap-semibold text-darkBrown mt-2">
              Don't have an account?
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/loginScreen/signup")}
            >
              <Text className="font-asap-semibold text-secondaryOrange mt-2">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Login;
