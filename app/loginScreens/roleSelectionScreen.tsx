import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const RoleSelectionScreen = () => {
  const handleSelection = (role: "tutor" | "tutee") => {
    router.push({
      pathname: "/loginScreens/questions", 
      params: { role },
    });
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header section */}
      <View className="bg-[#FFB42A] pt-20 pb-6 px-6 rounded-b-3xl items-center">
        <Text className="text-3xl font-bold text-[#893B14]">
          You're almost done!
        </Text>
      </View>

      {/* Role selection */}
      <View className="mt-16 items-center px-6">
        <Text className="text-xl text-[#FFB42A] mb-6">
          You're signing up as a...
        </Text>

        <View className="flex-row space-x-6">
          <Pressable
            onPress={() => handleSelection("tutor")}
            className="bg-[#FFD85C] rounded-xl px-8 py-4"
          >
            <Text className="text-[#893B14] font-semibold text-lg">Tutor</Text>
          </Pressable>

          <Pressable
            onPress={() => handleSelection("tutee")}
            className="bg-[#FFD85C] rounded-xl px-8 py-4"
          >
            <Text className="text-[#893B14] font-semibold text-lg">Tutee</Text>
          </Pressable>
        </View>

        <Text className="text-gray-400 text-sm mt-12 text-center px-6">
          Please choose one to load the rest of the questions
        </Text>
      </View>
    </View>
  );
};

export default RoleSelectionScreen;