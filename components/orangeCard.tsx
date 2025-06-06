import React from "react";
import { View } from "react-native";

const OrangeCard = ({ className, children }: any) => {
  const defaultStyles =
    "bg-paleOrange p-2 max-w-full w-screen border-paleOrange border-solid border-8 rounded-xl";
  return <View className={`${defaultStyles} ${className}`}>{children}</View>;
};

export default OrangeCard;
