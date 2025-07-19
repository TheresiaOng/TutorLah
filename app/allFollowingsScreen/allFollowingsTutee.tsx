import MiniProfile from "@/components/miniProfile";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Review = {
  id: string;
  tuteeName: string;
  reviewText: string;
  ratings: number;
};

const AllFollowiingsTutee = () => {
  const { currentFollowings } = useLocalSearchParams();
  const parsedFollowings = useMemo(() => {
    try {
      return currentFollowings ? JSON.parse(currentFollowings as string) : [];
    } catch (err) {
      console.error("Failed to parse listings:", err);
      return [];
    }
  }, [currentFollowings]);
  const [loading, setLoading] = useState(false);

  return (
    <View className="flex-1 bg-white justify-center items-center">
      {/* Header */}
      <View
        className={`border-8 w-full justify-center items-center h-1/6 border-primaryOrange bg-primaryOrange`}
      >
        <View className="flex-row w-11/12 items-center inset-y-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="items-center h-full justify-center mr-2"
          >
            <Image
              className="w-10"
              resizeMode="contain"
              source={require("../../assets/images/arrowBack.png")}
            />
          </TouchableOpacity>
          <Text className={`text-white font-asap-bold text-3xl`}>
            {`All Followings [${parsedFollowings.length}]`}
          </Text>
        </View>
      </View>

      {/* Card display logic */}
      <View className="h-5/6 w-full justify-center items-center">
        {/* Loading indicator */}
        {loading && (
          <View className="items-center flex-col justify-center w-full h-full">
            <ActivityIndicator size="large" />
            <Text className="font-asap-medium mt-4">Loading followings...</Text>
          </View>
        )}

        <FlatList
          data={parsedFollowings.slice(0, 5)}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => {
            return (
              <View className="items-center justify-center">
                <MiniProfile item={item} />
              </View>
            );
          }}
          className="w-full mt-2 mb-2 px-2"
          numColumns={4}
          columnWrapperStyle={{ justifyContent: "space-between" }}
        />
      </View>
    </View>
  );
};

export default AllFollowiingsTutee;

const styles = StyleSheet.create({});
