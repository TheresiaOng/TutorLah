import React from "react";
import { View } from "react-native";

const BlueCard = ({ className, children }: any) => {
  const defaultStyles =
    "bg-paleBlue p-2 max-w-full w-screen border-paleBlue border-solid border-8 rounded-xl";
  return <View className={`${defaultStyles} ${className}`}>{children}</View>;
};

export default BlueCard;
