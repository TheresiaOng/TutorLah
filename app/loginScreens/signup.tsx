import { router } from "expo-router";
import React, { useState } from "react";
import { Button, Pressable, Text, TextInput, View } from "react-native";
import QuestionDetails from "./questionDetails";

const RoleSelectionScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [hidden, setHidden] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSelection = (selectedRole: "tutor" | "tutee") => {
    setRole((prev) => (prev === selectedRole ? "" : selectedRole));
  };

  return (
    <View className="flex-1 bg-primary">
      {/* Header section */}
      <View className="items-center mt-16 w-20 left-4 border-primary border-2 bg-darkPrimary rounded-lg">
        <Button color="black" title="Back" onPress={() => router.back()} />
      </View>
      <View className="items-center p-4 pb-8 px-4">
        <Text className="text-3xl font-bold items-center text-accent">
          You're almost done!
        </Text>
      </View>

      <View className="flex-grow bg-white rounded-t-3xl">
        {/* Email and Password Input Section */}
        <View className="pt-8 justify-center items-center">
          {errorMsg != "" && (
            <Text className="text-sm mb-4 text-red-500">{errorMsg}</Text>
          )}

          {/* Input fields for email and password */}
          <TextInput
            className="border-2 border-gray p-2 mb-4 w-96"
            placeholder="Email"
            placeholderTextColor={"#000"}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <View className="flex flex-row items-center max-w-96">
            <TextInput
              className="border-2 border-gray p-2 mb-4 flex-1"
              secureTextEntry={hidden}
              placeholder="Password"
              placeholderTextColor={"#000"}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            {/* toggle password visibility */}
            <View className="min-w-12">
              <Button
                title={hidden ? "◡" : "👁️"}
                onPress={() => setHidden(!hidden)}
                color={"#000"}
              />
            </View>
          </View>
        </View>

        {/* Role selection */}
        <View className="items-center p-2">
          <Text className="text-xl font-medium text-primary mb-6">
            You're signing up as a...
          </Text>

          <View className="flex-row gap-6 space-x-6">
            <Pressable
              onPress={() => handleSelection("tutor")}
              className={`rounded-xl px-8 py-4 ${
                role === "tutor" ? "bg-primary" : "bg-lightGray"
              }`}
            >
              <Text
                className={`font-semibold text-lg ${
                  role === "tutor" ? "text-accent" : "text-darkGray"
                }`}
              >
                Tutor
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleSelection("tutee")}
              className={`rounded-xl px-8 py-4 ${
                role === "tutee" ? "bg-primary" : "bg-lightGray"
              }`}
            >
              <Text
                className={`font-semibold text-lg ${
                  role === "tutee" ? "text-accent" : "text-darkGray"
                }`}
              >
                Tutee
              </Text>
            </Pressable>
          </View>
          {role == "" && (
            <Text className="text-darkGray text-md mt-12 text-center px-6">
              Please choose one to load the rest of the questions
            </Text>
          )}
          {(role == "tutor" || role == "tutee") && (
            <QuestionDetails
              role={role as "tutor" | "tutee"}
              email={email}
              password={password}
              onError={(msg) => setErrorMsg(msg)}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default RoleSelectionScreen;
