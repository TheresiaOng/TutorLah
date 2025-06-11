import BlueCard from "@/components/blueCard";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type cardProps = {
  item: any;
  listId: string;
};

const TutorCard = ({ item }: cardProps) => {
  return (
    <BlueCard id={item.userId}>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname:
              item.role === "tutor"
                ? "/profileScreen/tutorProfile"
                : "/profileScreen/tuteeProfile",
            params: { id: item.userId },
          })
        }
      >
        <Text className="font-asap-bold text-xl text-darkBlue">
          {item.name}
        </Text>
      </TouchableOpacity>
      <View className="border-b border-secondaryBlue border-2 mt-2" />
      <View className="flex-row items-start">
        <Text className="font-asap-regular my-4 w-40 text-darkBlue">
          Education Level
        </Text>
        <Text className="font-asap-regular flex-shrink my-4 text-darkBlue">
          : {item.education}
        </Text>
      </View>
      <View className="flex-row items-start">
        <Text className="font-asap-regular my-4 w-40 text-darkBlue">
          Teaching Subjects
        </Text>
        <Text className="font-asap-regular flex-shrink my-4 text-darkBlue">
          : {item.subjects}
        </Text>
      </View>
      <View className="flex-row items-start">
        <Text className="font-asap-regular my-4 w-40 text-darkBlue">Price</Text>
        <Text className="font-asap-regular my-4 flex-shrink text-darkBlue">
          : S${item.price} /hr {item.negotiable == "yes" && "[Negotiable]"}
        </Text>
      </View>
    </BlueCard>
  );
};

export default TutorCard;
