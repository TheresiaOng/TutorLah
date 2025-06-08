import OrangeCard from "@/components/orangeCard";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type cardProps = {
  item: any;
  listId: string;
};

const TuteeCard = ({ item, listId }: cardProps) => {
  return (
    <OrangeCard id={item.userId} role={item.userRole}>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname:
              item.userRole === "tutor"
                ? "/profileScreen/tutorProfile"
                : "/profileScreen/tuteeProfile",
            params: { id: item.userId, role: item.userRole },
          })
        }
      >
        <Text className="font-asap-bold text-xl text-darkBrown">
          {item.name}
        </Text>
      </TouchableOpacity>
      <View className="border-b border-secondaryOrange border-2 mt-2" />
      <View className="flex-row items-start">
        <Text className="font-asap-regular my-4 w-40 text-darkBrown">
          Education Level
        </Text>
        <Text className="font-asap-regular my-4 flex-shrink text-darkBrown">
          : {item.education}
        </Text>
      </View>
      <View className="flex-row items-start">
        <Text className="font-asap-regular my-4 w-40 text-darkBrown">
          Subjects Wanted
        </Text>
        <Text className="font-asap-regular flex-shrink my-4 text-darkBrown">
          : {item.subjects}
        </Text>
      </View>
      <View className="flex-row items-start">
        <Text className="font-asap-regular my-4 w-40 text-darkBrown">
          Price Range
        </Text>
        <Text className="font-asap-regular my-4 flex-shrink text-darkBrown">
          : S${item.startPrice} - S${item.endPrice}
        </Text>
      </View>
    </OrangeCard>
  );
};

export default TuteeCard;
