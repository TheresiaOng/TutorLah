import OrangeCard from "@/components/orangeCard";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type cardProps = {
  item: any;
  id: string;
  role: "tutor" | "tutee";
};

const TuteeCard = ({ item, id, role }: cardProps) => {
  return (
    // Since these cards will be displayed on
    // tutor's page, they will be blue
    <OrangeCard id={id} role={role}>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname:
              role === "tutor"
                ? "/profileScreen/tutorProfile"
                : "/profileScreen/tuteeProfile",
            params: { id: id, role },
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
          : {item.educationLevel}
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

export default TuteeCard;
