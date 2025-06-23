import React from "react";
import { StyleSheet, View } from "react-native";

const OrangeCard = ({ className, children }: any) => {
  const defaultStyles =
    "bg-paleOrange p-2 w-90% mt-2 border-paleOrange border-solid border-8 rounded-xl";
  return (
    <View style={styles.shadow} className={`${defaultStyles} ${className}`}>
      {children}
    </View>
  );
};

export default OrangeCard;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
