import { useAuth } from "@/contexts/authContext";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebase";
import errorhandling from "./errorhandling";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidden, setHidden] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const { setUserDocID, userDocID, setUserRole, userRole } = useAuth();

  // Navigate to the home screen after successful login
  // This function is called only when the user successfully logs in
  const handleSuccess = async (uid: string) => {
    try {
      console.log("succesful sign in, checking for role");
      const document = await getDoc(doc(db, "users/roles/tutors", uid));
      if (document.exists()) {
        setUserRole("tutor");
      } else {
        setUserRole("tutee");
      }

      router.push({
        pathname: "/homeScreen/home",
        params: { id: userDocID, role: userRole },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const loginEmailPassword = async () => {
    if (email != "" && password != "") {
      try {
        // Sign in with email and password
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Set the user document in the auth context
        setUserDocID(userCredential.user.uid);
        console.log(userCredential.user);
        // Call the success function to navigate to the home screen
        handleSuccess(userCredential.user.uid);
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
              <Text className="font-asap-semibold text-primaryOrange mt-2">
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
