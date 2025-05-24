import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import QuestionsScreen from "./questions";

const RoleSelectionScreen = () => {
  const handleSelection = (selectedRole: "tutor" | "tutee") => {
    setRole((prev) => (prev === selectedRole ? "" : selectedRole));
  };

  const [role, setRole] = useState("");

  return (
    <View className="flex-1 bg-primary">
      {/* Header section */}
      <View className="items-center">
        <Text className="text-3xl font-bold p-20 items-center px-6 text-accent">
          You're almost done!
        </Text>
      </View>

      {/* Role selection */}
      <View className="flex-grow bg-white rounded-t-3xl">
        <View className="mt-16 items-center px-6">
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
            <QuestionsScreen role={role as "tutor" | "tutee"} />
          )}
        </View>
      </View>
    </View>
  );
};

export default RoleSelectionScreen;
