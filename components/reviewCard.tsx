import BlueCard from "@/components/blueCard";
import React from "react";
import { Text, View } from "react-native";

type Review = {
  tuteeName: string;
  reviewText: string;
  ratings: number;
};

const renderStars = (rating: number) => {
  if (rating > 5) {
    return (
      <Text className="color-primaryOrange font-asap-bold text-lg">
        {"★".repeat(5)}
      </Text>
    );
  } else {
    const filledStars = "★".repeat(rating);
    const emptyStars = "☆".repeat(5 - rating);

    return (
      <Text className="color-primaryOrange font-asap-bold text-lg">
        {filledStars + emptyStars}
      </Text>
    );
  }
};

const ReviewCard = ({ item }: { item: Review }) => (
  <BlueCard className="w-11/12">
    <View>
      <Text className="font-asap-semibold text-darkBlue">{item.tuteeName}</Text>
      {renderStars(item.ratings)}
      <Text className="mt-2 font-asap-regular text-darkBlue">
        "{item.reviewText}"
      </Text>
    </View>
  </BlueCard>
);

export default ReviewCard;
