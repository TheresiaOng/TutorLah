import BlueCard from "@/components/blueCard";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type cardProps = {
  item: any;
  id: string;
  role: "tutor" | "tutee";
};

const TutorCard = ({ item, id, role }: cardProps) => {
  return (
    // Since these cards will be displayed on
    // tutee's page, they will be orange
    <BlueCard id={id} role={role}>
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
        <Text className="font-asap-bold text-xl text-darkPrimaryBlue">
          {item.name}
        </Text>
      </TouchableOpacity>
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
