import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NullScreen = () => {
  return (
    <SafeAreaView>
      <View className="items-center flex-col justify-center w-full h-full">
        <ActivityIndicator size="large" />
        <Text className="font-asap-medium mt-4">
          Hold on tight! We are getting your content ready...
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default NullScreen;

const styles = StyleSheet.create({});
