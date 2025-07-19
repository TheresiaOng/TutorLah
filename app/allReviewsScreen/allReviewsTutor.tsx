import ReviewCard from "@/components/reviewCard";
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

const AllReviewsTutor = () => {
  const { currentReviews } = useLocalSearchParams();
  const parsedReviews = useMemo(() => {
    try {
      return currentReviews ? JSON.parse(currentReviews as string) : [];
    } catch (err) {
      console.error("Failed to parse listings:", err);
      return [];
    }
  }, [currentReviews]);
  const [loading, setLoading] = useState(false);

  return (
    <View className="flex-1 bg-white justify-center items-center">
      {/* Header */}
      <View
        className={`border-8 w-full justify-center items-center h-1/6 border-primaryBlue bg-primaryBlue`}
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
            {`All Reviews [${parsedReviews.length}]`}
          </Text>
        </View>
      </View>

      {/* Card display logic */}
      <View className="h-5/6 w-full justify-center items-center">
        {/* Loading indicator */}
        {loading && (
          <View className="items-center flex-col justify-center w-full h-full">
            <ActivityIndicator size="large" />
            <Text className="font-asap-medium mt-4">Loading reviews...</Text>
          </View>
        )}

        <FlatList
          data={parsedReviews}
          keyExtractor={(item) => item.id} //every flatlist need a unique key id
          renderItem={({ item }) => (
            <View className="items-center w-screen">
              <ReviewCard item={item} />
            </View>
          )}
          className="mt-4 mb-4"
          ItemSeparatorComponent={() => <View className="h-4" />} // Adds vertical spacing
        />
      </View>
    </View>
  );
};

export default AllReviewsTutor;

const styles = StyleSheet.create({});
