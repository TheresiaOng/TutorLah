import React from "react";
import { Text, View } from "react-native";

const TutorCard = ({ item }: any) => {
  return (
    <View className="bg-paleYellow m-2 p-2 w-96 border-paleYellow border-solid border-8 rounded-xl">
      <Text className="font-bold text-xl text-accent">{item.name}</Text>
      <View className="border-b border-secondary border-2 mt-2" />
      <View className="flex-row items-start">
        <Text className="font-normal my-4 w-40 text-accent">
          Education Level
        </Text>
        <Text className="font-normal my-4 text-accent">
          : {item.educationLevel}
        </Text>
      </View>
      <View className="flex-row items-start">
        <Text className="font-normal my-4 w-40 text-accent">
          Teaching Subjects
        </Text>
        <Text className="font-normal my-4 text-accent">
          : {item.teachableSubjects}
        </Text>
      </View>
      <View className="flex-row items-start">
        <Text className="font-normal my-4 w-40 text-accent">Price</Text>
        <Text className="font-normal my-4 text-accent">: S$50/hr</Text>
      </View>
    </View>
  );
};

export default TutorCard;
