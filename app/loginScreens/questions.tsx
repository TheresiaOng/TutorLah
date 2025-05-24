import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const QuestionsScreen = () => {
  const { role } = useLocalSearchParams();

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-20">
      <Text className="text-3xl font-bold text-[#FFB42A] mb-4">
        Welcome, {role === "tutor" ? "Tutor" : "Tutee"}!
      </Text>

      <Text className="text-lg text-[#893B14] mb-6">
        Please answer the following questions:
      </Text>

      {role === "tutor" ? (
        <View className="space-y-4">
          <Text className="text-base text-[#333]">
            1. What subjects can you teach?
          </Text>
          <Text className="text-base text-[#333]">
            2. What is your availability?
          </Text>
          <Text className="text-base text-[#333]">
            3. What is your teaching experience?
          </Text>
        </View>
      ) : (
        <View className="space-y-4">
          <Text className="text-base text-[#333]">
            1. What subjects do you need help with?
          </Text>
          <Text className="text-base text-[#333]">
            2. What is your preferred learning time?
          </Text>
          <Text className="text-base text-[#333]">
            3. Have you had a tutor before?
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default QuestionsScreen;
