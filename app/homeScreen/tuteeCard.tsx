import CustomButton from "@/components/customButton";
import OrangeCard from "@/components/orangeCard";
import { useAuth } from "@/contexts/AuthProvider";
import { useChat } from "@/contexts/ChatProvider";
import { db } from "@/firebase";
import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import GetOrCreateChat from "../chatScreen/getOrCreateChat";
import NullScreen from "../nullScreen";

type cardProps = {
  item: any;
  listId: string;
  onDelete?: (listId: string) => void;
};

const TuteeCard = ({ item, listId, onDelete }: cardProps) => {
  const [loadingChat, setLoadingChat] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const { userDoc } = useAuth();
  if (!userDoc) return <NullScreen />;

  const { client, setChannel } = useChat();

  useEffect(() => {
    const loadProfileUrl = async () => {
      try {
        const userRef = doc(db, "users", item?.userId); // use item's ID here!
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfilePicUrl(data.photoUrl ?? null);
        } else {
          console.log("No such user found.");
        }
      } catch (error) {
        console.error("Error fetching user photoUrl:", error);
      }
    };

    loadProfileUrl();
  }, [item?.userId]);

  const handleChatPress = async () => {
    setLoadingChat(true);
    try {
      // Get chat if exists else create one
      const channel = await GetOrCreateChat({
        client,
        currentUserId: userDoc.userId,
        otherUserId: item?.userId,
      });

      setChannel(channel);
      router.push(`/chatScreen/${channel.cid}`); // Route to designated chat
      setLoadingChat(false);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to start to load chat, please try again later."
      );
      setLoadingChat(false);
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
      <OrangeCard id={item.userId}>
        {/* Pressable Name -> Profile */}
        <TouchableOpacity
          className="flex-row items-center mb-2"
          onPress={() =>
            router.push({
              pathname: "/profileScreen/tuteeProfile",
              params: { id: item?.userId },
            })
          }
        >
          <Image
            source={
              profilePicUrl
                ? { uri: profilePicUrl }
                : require("../../assets/images/hatLogo.png")
            }
            className={`w-14 h-14 border-2 border-white rounded-full mr-3 ${
              !profilePicUrl && "pt-2 bg-white"
            }`}
            resizeMode="cover"
          />
          <Text className="font-asap-bold text-xl text-darkBrown">
            {item?.name.length > 13
              ? item.name.slice(0, 13) + "..."
              : item.name}
          </Text>
        </TouchableOpacity>
        <View className="border-b border-secondaryOrange border-2 mt-2" />
        <View className="flex-row items-start">
          <Text className="font-asap-semibold my-4 w-40 text-darkBrown">
            Education Level
          </Text>
          <Text className="font-asap-regular my-4 flex-shrink text-darkBrown">
            : {item?.education}
          </Text>
        </View>
        <View className="flex-row items-start">
          <Text className="font-asap-semibold my-4 w-40 text-darkBrown">
            Subjects Wanted
          </Text>
          <Text className="font-asap-regular flex-shrink my-4 text-darkBrown">
            : {item?.subjects}
          </Text>
        </View>
        <View className="flex-row items-start">
          <Text className="font-asap-semibold my-4 w-40 text-darkBrown">
            Days Available
          </Text>
          <Text className="font-asap-regular my-4 flex-shrink text-darkBrown">
            : {item.date?.join(", ")}
          </Text>
        </View>
        <View className="flex-row items-start">
          <Text className="font-asap-semibold my-4 w-40 text-darkBrown">
            Time Available
          </Text>
          <Text className="font-asap-regular my-4 flex-shrink text-darkBrown">
            : {item.startTime} - {item.endTime}
          </Text>
        </View>
        <View className="flex-row items-start">
          <Text className="font-asap-semibold my-4 w-40 text-darkBrown">
            {item?.startPrice !== item?.endPrice ? "Price Range" : "Price"}
          </Text>
          <Text className="font-asap-regular my-4 flex-shrink text-darkBrown">
            {item?.startPrice !== item?.endPrice
              ? `: S$${item?.startPrice} - S$${item?.endPrice} /hr`
              : `: S$${item?.startPrice} /hr`}
          </Text>
        </View>
        {item?.userId !== userDoc?.userId && (
          <View className="flex-row justify-between">
            <View className="w-1/2 pr-4">
              <CustomButton
                title="Chat"
                onPress={handleChatPress}
                role="tutee"
                loading={loadingChat}
              />
            </View>
            <View className="w-1/2 pl-4">
              <CustomButton
                title="View Profile"
                onPress={() =>
                  router.push({
                    pathname: "/profileScreen/tuteeProfile",
                    params: { id: item?.userId },
                  })
                }
                role="tutee"
              />
            </View>
          </View>
        )}
      </OrangeCard>
    </>
  );
};

export default TuteeCard;
