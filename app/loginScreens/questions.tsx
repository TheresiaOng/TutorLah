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
            Educational level
          </Text>
          <Text className="text-base text-[#333]">
            Education Institute Name
          </Text>
          <Text className="text-base text-[#333]">
            Achievements
          </Text>
          <Text className="text-base text-[#333]">
            Teachable Subjects
          </Text>
        </View>
      ) : (
        <View className="space-y-4">
          <Text className="text-base text-[#333]">
            Education Level
          </Text>
          <Text className="text-base text-[#333]">
            Education Institute Name
          </Text>
          <Text className="text-base text-[#333]">
            Subjects To Learn
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default QuestionsScreen;
