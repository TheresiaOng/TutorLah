import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MniProfile = {
  item: any;
};

const MiniProfile = ({ item }: MniProfile) => {
  return (
    <View className="flex-col items-center p-2 justify-center">
      <View className="w-20 h-20 bg-white border-primaryOrange border-2 items-center justify-center rounded-full">
        <Image
          source={require("../assets/images/hatLogo.png")}
          className="h-16 w-16 mt-2 rounded-full"
        />
      </View>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname:
              item.role === "tutor"
                ? "/profileScreen/tutorProfile"
                : "/profileScreen/tuteeProfile",
            params: { id: item.userId },
          })
        }
      >
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="text-darkBrown font-asap-bold text-lg"
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MiniProfile;

const styles = StyleSheet.create({});
