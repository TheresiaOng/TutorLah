import BlueCard from "@/components/blueCard";
import CustomButton from "@/components/customButton";
import { useAuth } from "@/contexts/AuthProvider";
import { useChat } from "@/contexts/ChatProvider";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import GetOrCreateChat from "../chatScreen/getOrCreateChat";
import NullScreen from "../nullScreen";

type cardProps = {
  item: any;
  listId: string;
  onDelete?: (listId: string) => void;
};

const TutorCard = ({ item, listId, onDelete }: cardProps) => {
  const [loading, setLoading] = useState(false);
  const { userDoc } = useAuth();
  if (!userDoc) return <NullScreen />;

  const { client, setChannel } = useChat();

  const handleChatPress = async () => {
    setLoading(true);

    try {
      // Get chat if exists else create one
      const channel = await GetOrCreateChat({
        client,
        currentUserId: userDoc.userId,
        otherUserId: item?.userId,
      });

      setChannel(channel);
      router.push(`/chatScreen/${channel.cid}`); // Route to designated chat
      setLoading(false);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to start to load chat, please try again later."
      );
      setLoading(false);
      console.error("Failed to start or load chat:", error);
    }
  };

  return (
    <>
      {/* Delete Button */}
      {onDelete && (
        <TouchableOpacity
          onPress={() => onDelete(listId)}
          className="absolute -top-1 right-3 z-10"
        >
          <Image
            source={require("@/assets/images/cancel.png")}
            className="bg-red-500 rounded-full p-1 w-8 h-8"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      <BlueCard id={item.userId}>
        {/* Pressable Name -> Profile */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname:
                item.role === "tutor"
                  ? "/profileScreen/tutorProfile"
                  : "/profileScreen/tuteeProfile",
              params: { id: item?.userId },
            })
          }
        >
          {/* Card details */}
          <Text className="font-asap-bold text-xl text-darkBlue">
            {item?.name}
          </Text>
        </TouchableOpacity>
        <View className="border-b border-secondaryBlue border-2 mt-2" />
        <View className="flex-row items-start">
          <Text className="font-asap-semibold my-4 w-40 text-darkBlue">
            Education Level
          </Text>
          <Text className="font-asap-regular flex-shrink my-4 text-darkBlue">
            : {item?.education}
          </Text>
        </View>
        <View className="flex-row items-start">
          <Text className="font-asap-semibold my-4 w-40 text-darkBlue">
            Teaching Subjects
          </Text>
          <Text className="font-asap-regular flex-shrink my-4 text-darkBlue">
            : {item?.subjects}
          </Text>
        </View>
        <View className="flex-row items-start">
          <Text className="font-asap-semibold my-4 w-40 text-darkBlue">
            Price
          </Text>
          <Text className="font-asap-regular my-4 flex-shrink text-darkBlue">
            : S${item?.price} /hr {item?.negotiable == "yes" && "[Negotiable]"}
          </Text>
        </View>
        {item?.userId !== userDoc?.userId && (
          <CustomButton
            title="Chat"
            onPress={handleChatPress}
            role="tutor"
            loading={loading}
          />
        )}
      </BlueCard>
    </>
  );
};

export default TutorCard;
