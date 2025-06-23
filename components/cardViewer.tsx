import TuteeCard from "@/app/homeScreen/tuteeCard";
import TutorCard from "@/app/homeScreen/tutorCard";
import React, { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";

type Listing = {
  listId: string;
  role: "tutor" | "tutee";
};

type CardViewerProps = {
  listings: Listing[];
};

const CardViewer = ({ listings }: CardViewerProps) => {
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    if (index < listings.length - 1) setIndex(index + 1);
  };

  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <View className="flex-1 justify-center items-center px-4">
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
          {listings[0].role === "tutor" ? (
            <TutorCard item={listings[index]} listId={listings[index].listId} />
          ) : (
            <TuteeCard item={listings[index]} listId={listings[index].listId} />
          )}
        </View>

        <TouchableOpacity
          className="justify-center items-center"
          onPress={handleNext}
          disabled={index === listings.length - 1}
        >
          <Image
            source={require("../assets/images/arrowRight.png")}
            className={`w-8 h-8 ${
              index === listings.length - 1 ? "opacity-0" : "opacity-100"
            }`}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default CardViewer;
