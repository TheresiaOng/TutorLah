import CustomButton from "@/components/customButton";
import { useAuth } from "@/contexts/AuthProvider";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const comingSoon = () => {
  const { userDoc } = useAuth();
  return (
    <View className="bg-white h-full items-center justify-center">
      <Text className="text-lg font-asap-bold">You caught us!</Text>
      <Text className="text-lg font-asap-medium">
        This feature is coming in the next update
      </Text>
      <View className="w-64">
        <CustomButton
          title="Go Back"
          role={userDoc?.role}
          onPress={() => router.back()}
          extraClassName="w-32 mt-6"
        />
      </View>
    </View>
  );
};

export default comingSoon;
