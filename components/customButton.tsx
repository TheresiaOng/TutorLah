import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  role: "tutor" | "tutee";
  extraClassName?: string; // Optional extra className prop
  active?: boolean; // Optional setting
  loading?: boolean; // Optional setting
};

const CustomButton = ({
  title,
  onPress,
  role,
  extraClassName = "",
  active = true,
  loading = false,
}: CustomButtonProps) => {
  return (
    <View className="items-center justify-center w-full">
      <TouchableOpacity
        className={`${extraClassName} h-14 w-full rounded-lg items-center justify-center
          ${
            !loading && active // If loading and not active, color turns gray
              ? role === "tutor"
                ? "bg-secondaryBlue border-secondaryBlue"
                : "bg-secondaryOrange border-secondaryOrange"
              : "bg-lightGray border-lightGray"
          }`}
        onPress={onPress}
        disabled={loading || !active}
      >
        {loading ? ( // Show loading indicator if loading
          <ActivityIndicator size="small" />
        ) : (
          <Text
            className={`font-asap-bold text-lg
            ${
              active
                ? role === "tutor"
                  ? "text-darkBlue"
                  : "text-darkBrown"
                : "text-darkGray"
            }`}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
