import TuteeCard from "@/app/homeScreen/tuteeCard";
import TutorCard from "@/app/homeScreen/tutorCard";
import ReviewCard from "@/components/reviewCard";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Listing = {
  listId: string;
  role: "tutor" | "tutee";
};

type Review = {
  tuteeName: string;
  reviewText: string;
  ratings: number;
};

type Following = {
  userId: string;
  name: string;
  role: "tutor" | "tutee";
};

type CardViewerProps =
  | { listings: Listing[]; reviews?: never; following?: never }
  | { reviews: Review[]; listings?: never; following?: never }
  | { following: Following[]; listings?: never; reviews?: never };

const CardViewer = ({ listings, reviews, following }: CardViewerProps) => {
  const [index, setIndex] = useState(0);
  const data = listings ?? reviews ?? following ?? [];
  const handleNext = () => {
    if (index < data.length - 1) setIndex(index + 1);
  };

  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <View className="justify-center items-center px-4">
      <View className="flex-row mt-4 justify-between w-full">
        <TouchableOpacity
          className="justify-center items-center"
          onPress={handlePrev}
          disabled={index === 0}
        >
          <Image
            source={require("../assets/images/arrowLeft.png")}
            className={`w-8 h-8 ${index === 0 ? "opacity-0" : "opacity-100"}`}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View className="-mx-2 justify-center items-center">
          {listings &&
            (listings[0].role === "tutor" ? (
              <TutorCard
                item={listings[index]}
                listId={listings[index]?.listId}
              />
            ) : (
              <TuteeCard
                item={listings[index]}
                listId={listings[index]?.listId}
              />
            ))}
          {reviews && <ReviewCard item={reviews?.[index]} />}
          {following && following.length > 0 && following[index] && (
            <View className="items-center">
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname:
                      following[index].role === "tutor"
                        ? "/profileScreen/tutorProfile"
                        : "/profileScreen/tuteeProfile",
                    params: { id: following[index].userId },
                  })
                }
              >
                <Text className="text-lg font-asap-bold text-darkBrown">
                  {following[index].name}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          className="justify-center items-center"
          onPress={handleNext}
          disabled={index === data.length - 1}
        >
          <Image
            source={require("../assets/images/arrowRight.png")}
            className={`w-8 h-8 ${
              index === data.length - 1 ? "opacity-0" : "opacity-100"
            }`}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default CardViewer;
