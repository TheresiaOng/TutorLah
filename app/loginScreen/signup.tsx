import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import QuestionDetails, { QuestionDetailsRef } from "./questionDetails";

const RoleSelectionScreen = () => {
  const questionRef = useRef<QuestionDetailsRef>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [hidden, setHidden] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSelection = (selectedRole: "tutor" | "tutee") => {
    setRole((prev) => (prev === selectedRole ? "" : selectedRole));
    setErrorMsg("");
  };

  return (
    <View
      className={`flex-1 ${
        role === "tutor" ? "bg-primaryBlue" : "bg-primaryOrange"
      }`}
    >
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
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80} // adjust based on your header height
      >
        <View className="flex-grow bg-white rounded-t-3xl">
          {/* Role selection */}
          <View className="items-center">
            <Text
              className={`text-xl font-asap-medium mt-8 mb-6 ${
                role === "tutor"
                  ? "text-darkPrimaryBlue"
                  : "text-darkPrimaryOrange"
              }`}
            >
              You're signing up as a...
            </Text>

            <View className="flex-row gap-6">
              <Pressable
                onPress={() => handleSelection("tutor")}
                className={`rounded-xl px-8 py-4 ${
                  role === "tutor" ? "bg-secondaryBlue" : "bg-lightGray"
                }`}
              >
                <Text
                  className={`font-asap-semibold text-lg ${
                    role === "tutor" ? "text-darkBlue" : "text-darkGray"
                  }`}
                >
                  Tutor
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleSelection("tutee")}
                className={`rounded-xl px-8 py-4 ${
                  role === "tutee" ? "bg-secondaryOrange" : "bg-lightGray"
                }`}
              >
                <Text
                  className={`font-asap-semibold text-lg ${
                    role === "tutee" ? "text-darkBrown" : "text-darkGray"
                  }`}
                >
                  Tutee
                </Text>
              </Pressable>
            </View>

            {errorMsg != "" && (
              <Text className="text-sm mt-4 text-red-500">{errorMsg}</Text>
            )}

            {/* Email and Password Input Section */}
            <ScrollView className="h-3/5 w-full my-4 mt-6 px-6">
              <View className="justify-center items-center">
                {/* Input fields for email and password */}
                <View className="items-start w-full">
                  <Text
                    className={`text-sm pl-4 font-asap-medium ${
                      role === "tutor"
                        ? "text-darkPrimaryBlue"
                        : "text-darkPrimaryOrange"
                    }`}
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
                    className={`text-sm pl-4 font-asap-medium ${
                      role === "tutor"
                        ? "text-darkPrimaryBlue"
                        : "text-darkPrimaryOrange"
                    }`}
                  >
                    Password
                  </Text>
                  <View className="flex flex-row items-center">
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
                </View>
              </View>

              {role == "" && (
                <Text className="text-darkGray font-asap-regular text-sm mt-12 px-12 text-center">
                  Please choose one of the role to load the rest of the
                  questions
                </Text>
              )}
              {(role == "tutor" || role == "tutee") && (
                <QuestionDetails
                  ref={questionRef}
                  role={role as "tutor" | "tutee"}
                  email={email}
                  password={password}
                  onError={(msg) => setErrorMsg(msg)}
                  next={() => console.log("Signing Up...")}
                />
              )}
            </ScrollView>
            <View className="px-6 w-full">
              <TouchableOpacity
                disabled={role === ""}
                onPress={() => questionRef.current?.submit()}
                className={`${
                  role !== ""
                    ? role === "tutor"
                      ? "bg-secondaryBlue"
                      : "bg-secondaryOrange"
                    : "bg-lightGray"
                } w-full items-center py-3 rounded-xl`}
              >
                <Text
                  className={`${
                    role !== ""
                      ? role === "tutor"
                        ? "text-darkBlue"
                        : "text-darkBrown"
                      : "text-darkGray"
                  } font-asap-bold`}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row w-full items-center justify-center gap-1">
              <Text
                className={`font-asap-semibold ${
                  role == "tutor" ? "text-darkBlue" : "text-darkBrown"
                } mt-2`}
              >
                Already have an account?
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/loginScreen/login")}
              >
                <Text
                  className={`font-asap-semibold mt-2 ${
                    role === "tutor"
                      ? "text-secondaryBlue"
                      : "text-secondaryOrange"
                  }`}
                >
                  Log In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RoleSelectionScreen;
