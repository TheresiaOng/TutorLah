import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  role: "tutor" | "tutee";
};

const CustomButton = ({ title, onPress, role }: CustomButtonProps) => {
  return (
    <View className="flex-row items-center justify-center">
      <TouchableOpacity
        className={` h-14 w-full rounded-lg items-center justify-center
          ${
            role === "tutor"
              ? "bg-secondaryBlue border-secondaryBlue"
              : "bg-secondaryOrange border-secondaryOrange"
          }`}
        onPress={onPress}
      >
        <Text
          className={`font-asap-medium text-lg
            ${role === "tutor" ? "text-darkBlue" : "text-darkBrown"}`}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
