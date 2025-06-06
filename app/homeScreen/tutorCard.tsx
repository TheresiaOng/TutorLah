import BlueCard from "@/components/blueCard";
import React from "react";
import { Text, View } from "react-native";

const TutorCard = ({ item }: any) => {
  return (
    // Since these cards will be displayed on
    // tutee's page, they will be orange
    <BlueCard>
      <Text className="font-asap-bold text-xl text-darkPrimaryBlue">
        {item.name}
      </Text>
      <View className="border-b border-secondaryBlue border-2 mt-2" />
      <View className="flex-row items-start">
        <Text className="font-asap-regular my-4 w-40 text-darkPrimaryBlue">
          Education Level
        </Text>
        <Text className="font-asap-regular flex-shrink my-4 text-darkPrimaryBlue">
          : {item.educationLevel}
        </Text>
      </View>
      <View className="flex-row items-start">
        <Text className="font-asap-regular my-4 w-40 text-darkPrimaryBlue">
          Price
        </Text>
        <Text className="font-asap-regular my-4 flex-shrink text-darkPrimaryBlue">
          : S$50/hr
        </Text>
      </View>
    </BlueCard>
  );
};

export default TutorCard;
