import OrangeCard from "@/components/orangeCard";
import React from "react";
import { Text, View } from "react-native";

const TutorCard = ({ item }: any) => {
  return (
    // Since these cards will be displayed on
    // tutee's page, they will be orange
    <OrangeCard>
      <Text className="font-asap-bold text-xl text-darkBrown">{item.name}</Text>
      <View className="border-b border-secondaryOrange border-2 mt-2" />
      <View className="flex-row items-start">
        <Text className="font-asap-regular my-4 w-40 text-darkBrown">
          Education Level
        </Text>
        <Text className="font-asap-regular flex-shrink my-4 text-darkBrown">
          : {item.educationLevel}
        </Text>
      </View>
      <View className="flex-row items-start">
        <Text className="font-asap-regular my-4 w-40 text-darkBrown">
          Teaching Subjects
        </Text>
        <Text className="font-asap-regular flex-shrink my-4 text-darkBrown">
          : {item.teachableSubjects}
        </Text>
      </View>
      <View className="flex-row items-start">
        <Text className="font-asap-regular my-4 w-40 text-darkBrown">
          Price
        </Text>
        <Text className="font-asap-regular my-4 flex-shrink text-darkBrown">
          : S$50/hr
        </Text>
      </View>
    </OrangeCard>
  );
};

export default TutorCard;
