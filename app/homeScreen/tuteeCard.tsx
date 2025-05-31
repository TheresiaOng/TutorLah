import BlueCard from "@/components/blueCard";
import React from "react";
import { Text, View } from "react-native";

const TuteeCard = ({ item }: any) => {
  return (
    // Since these cards will be displayed on
    // tutor's page, they will be blue
    <BlueCard>
      <Text className="font-asap-bold text-xl text-darkPrimaryBlue">
        {item.name}
      </Text>
      <View className="border-b border-darkPrimaryBlue border-2 mt-2" />
      <View className="flex-row items-start">
        <Text className="font-asap-regular my-4 w-40 text-darkPrimaryBlue">
          Education Level
        </Text>
        <Text className="font-asap-regular my-4 flex-shrink text-darkPrimaryBlue">
          : {item.educationLevel}
        </Text>
      </View>
      <View className="flex-row items-start">
        <Text className="font-asap-regular my-4 w-40 text-darkPrimaryBlue">
          Subjects Wanted
        </Text>
        <Text className="font-asap-regular flex-shrink my-4 text-darkPrimaryBlue">
          : {item.subjectsToLearn}
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

export default TuteeCard;
