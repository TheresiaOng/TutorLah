import CustomButton from "@/components/customButton";
import OrangeCard from "@/components/orangeCard";
import { useAuth } from "@/contexts/AuthProvider";
import { useChat } from "@/contexts/ChatProvider";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import GetOrCreateChannel from "../chatScreen/getOrCreateChannel";

type cardProps = {
  item: any;
  listId: string;
};

const TuteeCard = ({ item }: cardProps) => {
  const { userDoc } = useAuth();
  const { client, setChannel } = useChat();

  const handleChatPress = async () => {
    if (userDoc?.userId === item.userId) return;

    try {
      const channel = await GetOrCreateChannel({
        client,
        currentUserId: userDoc.userId,
        otherUserId: item.userId,
      });

      setChannel(channel);
      router.push(`/chatScreen/${channel.cid}`);
    } catch (error) {
      console.error("Failed to start or load chat:", error);
    }
  };

  return (
    <OrangeCard id={item.userId}>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname:
              item.userRole === "tutor"
                ? "/profileScreen/tutorProfile"
                : "/profileScreen/tuteeProfile",
            params: { id: item.userId },
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
          : S${item.startPrice} - S${item.endPrice} /hr
        </Text>
      </View>
      {item.userId !== userDoc?.userId && (
        <CustomButton title="Chat" onPress={handleChatPress} role="tutee" />
      )}
    </OrangeCard>
  );
};

export default TuteeCard;
