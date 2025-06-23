import BlueCard from "@/components/blueCard";
import React from "react";
import { Text, View } from "react-native";

type Review = {
  tuteeName: string;
  reviewText: string;
};

const ReviewCard = ({ item }: { item: Review }) => (
  <BlueCard className="w-11/12">
    <View>
      <Text className="font-asap-semibold text-darkBlue">{item.tuteeName}</Text>
      <Text className="mt-2 font-asap-regular text-darkBlue">"{item.reviewText}"</Text>
    </View>
  </BlueCard>
);

export default ReviewCard;