import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  role: "tutor" | "tutee";
  extraClassName?: string;
};

const CustomButton = ({
  title,
  onPress,
  role,
  extraClassName = "",
}: CustomButtonProps) => {
  return (
    <View className="items-center justify-center w-full">
      <TouchableOpacity
        className={`h-14 w-full rounded-lg items-center justify-center
          ${
            role === "tutor"
              ? "bg-secondaryBlue border-secondaryBlue"
              : "bg-secondaryOrange border-secondaryOrange"
          } ${extraClassName}`}
        onPress={onPress}
      >
        <Text
          className={`font-asap-bold text-lg
            ${role === "tutor" ? "text-darkBlue" : "text-darkBrown"}`}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
