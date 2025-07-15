import CustomButton from "@/components/customButton";
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
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);

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
      {/* Header */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-16 mb-6 w-10 h-10 left-5 items-center justify-center"
        disabled={isSigningUp}
      >
        <Image
          className="w-10"
          resizeMode="contain"
          source={require("../../assets/images/arrowBack.png")}
        />
      </TouchableOpacity>

      <View className="flex-1 bg-white rounded-t-3xl pt-12 px-6">
        {/* Role selection */}
        <View className="items-center">
          <Text
            className={`text-xl font-asap-medium mb-6 ${
              role === "tutor"
                ? "text-darkPrimaryBlue"
                : "text-darkPrimaryOrange"
            }`}
          >
            You're signing up as a...
          </Text>

          <View className="flex-row gap-6 mb-4">
            <Pressable
              onPress={() => handleSelection("tutor")}
              className={`rounded-xl px-8 py-4 ${
                role === "tutor" ? "bg-secondaryBlue" : "bg-lightGray"
              }`}
              disabled={isSigningUp}
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
              disabled={isSigningUp}
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

          {errorMsg !== "" && (
            <Text className="text-sm text-red-500 mb-2">{errorMsg}</Text>
          )}
        </View>

        {/* Scrollable Form and Question Fields */}
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Email and Password */}
            <View className="w-full mt-2">
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
                className="border-2 border-gray font-asap-regular rounded-full p-3 mb-4 w-full"
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
                  className="border-2 border-gray p-3 font-asap-regular rounded-full mb-4 flex-1"
                  secureTextEntry={hidden}
                  placeholderTextColor={"#000"}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setHidden(!hidden)}
                  className="rounded-full items-center justify-center min-w-12 h-12"
                  disabled={isSigningUp}
                >
                  <Image
                    className="w-7 -inset-y-2"
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

            {/* Question details based on roles */}
            {role === "" && (
              <Text className="text-darkGray font-asap-regular text-sm mt-12 px-12 text-center">
                Please choose one of the roles to load the rest of the questions
              </Text>
            )}

            {(role === "tutor" || role === "tutee") && (
              <QuestionDetails
                ref={questionRef}
                role={role as "tutor" | "tutee"}
                email={email}
                password={password}
                onError={(msg) => setErrorMsg(msg)}
                onChangeComplete={setIsFormComplete}
                setLoading={setIsSigningUp}
                next={() => console.log("Signing Up...")}
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Bottom Section */}
        <View className="mb-12">
          <CustomButton
            title="Sign Up"
            role={role as "tutor" | "tutee"}
            onPress={() => questionRef.current?.submit()}
            active={isFormComplete}
            loading={isSigningUp}
          />

          <View className="flex-row w-full items-center justify-center gap-1 mt-2">
            <Text
              className={`font-asap-semibold ${
                role === "tutor" ? "text-darkBlue" : "text-darkBrown"
              }`}
            >
              Already have an account?
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/loginScreen/login")}
              disabled={isSigningUp}
            >
              <Text
                className={`font-asap-semibold ${
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
    </View>
  );
};

export default RoleSelectionScreen;
