import React from "react";
import { StyleSheet, View } from "react-native";

const BlueCard = ({ className, children }: any) => {
  const defaultStyles =
    "bg-paleBlue p-2 w-full my-2 border-paleBlue border-solid border-8 rounded-xl";
  return (
    <View style={styles.shadow} className={`${defaultStyles} ${className}`}>
      {children}
    </View>
  );
};

export default BlueCard;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
