import CustomButton from "@/components/customButton";
import OrangeCard from "@/components/orangeCard";
import { useAuth } from "@/contexts/AuthProvider";
import { auth, db } from "@/firebase";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useGlobalSearchParams } from "expo-router/build/hooks";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { StreamChat } from "stream-chat";

const TuteeProfile = () => {
  const [currentDoc, setCurrentDoc] = useState<any>(null);
  const { userDoc } = useAuth();
  const { id: viewingUserId } = useGlobalSearchParams();
  const otherUserId = Array.isArray(viewingUserId)
    ? viewingUserId[0]
    : viewingUserId;

  function getStreamApiKey(): string {
    const key = Constants.expoConfig?.extra?.streamApiKey;
    if (!key) {
      throw new Error("Missing STREAM_API_KEY in app.config.js or .env");
    }
    return key;
  }

  const client = StreamChat.getInstance(getStreamApiKey());

  useEffect(() => {
    const fetchProfileDoc = async () => {
      const userIdToView = otherUserId ?? userDoc?.userId;
      if (!userIdToView) return;
      if (userIdToView === userDoc?.userId) {
        setCurrentDoc(userDoc);
        return;
      }

      try {
        const docRef = doc(db, "users", userIdToView);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setCurrentDoc(snapshot.data());
        } else {
          console.log("No such document!");
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };

    fetchProfileDoc();
  }, [viewingUserId, userDoc]);

  const isOwnProfile = !viewingUserId || viewingUserId === userDoc?.userId;

  // if the user is not logged in, redirect to login page
  const handleLogout = async () => {
    await signOut(auth);
    await client.disconnectUser();
    router.push("/");
  };

  return (
    <View className="flex-1 bg-white justify-center items-center">
      {/* Header */}
      <View className="border-8 border-primaryOrange bg-primaryOrange w-full justify-center items-center h-1/4">
        {/* Profile pic and Name */}
        <View className="flex-row w-11/12 items-center inset-y-9">
          <TouchableOpacity
            onPress={() => router.back()}
            className="items-center justify-center mr-2"
          >
            <Image
              className="w-10"
              resizeMode="contain"
              source={require("../../assets/images/arrowBack.png")}
            />
          </TouchableOpacity>

          <View className="w-20 h-20 bg-white items-center rounded-full">
            <Image
              source={require("../../assets/images/hatLogo.png")}
              className="h-20 w-20 rounded-full mt-1 p-2"
            />
          </View>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="text-4xl w-3/5 pl-4 flex-wrap text-darkBrown font-asap-bold"
          >
            {currentDoc?.name || "User"}
          </Text>
        </View>
      </View>

      {/* Personal Info Card */}
      <View className="h-5/6 w-full items-center">
        <ScrollView className="w-full">
          <View className="items-center w-full">
            <OrangeCard className="mt-4">
              <View className="flex-row items-start">
                <Text className="font-asap-semibold my-4 w-40 text-darkBrown">
                  Education Institute
                </Text>
                <Text className="font-asap-regular my-4 flex-shrink text-darkBrown">
                  : {currentDoc?.educationInstitute}
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="font-asap-semibold my-4 w-40 text-darkBrown">
                  Education Level
                </Text>
                <Text className="font-asap-regular my-4 flex-shrink text-darkBrown">
                  : {currentDoc?.educationLevel}
                </Text>
              </View>
            </OrangeCard>
          </View>

          {/* Following Section */}
          {isOwnProfile && (
            <View className="flex-col border-primaryOrange border-t-2 pt-2 mx-4 mt-4">
              <Text className="color-darkBrown text-2xl font-asap-bold">
                Following
              </Text>
              <View className="items-center">
                <Text className="p-8 font-asap-regular text-darkGray">
                  You have no following right now
                </Text>
              </View>
            </View>
          )}

          {/* Listing Section */}
          <View className="flex-col border-primaryOrange border-t-2 pt-2 mx-4 mt-4">
            <Text className="color-darkBrown text-2xl font-asap-bold">
              {isOwnProfile ? "Your Listing" : "Listing"}
            </Text>
            <View className="items-center">
              <Text className="p-8 font-asap-regular text-darkGray">
                {isOwnProfile
                  ? "You have no listing right now"
                  : "No listing at the moment"}
              </Text>
            </View>

            {/* Logout Button */}
            {isOwnProfile && (
              <CustomButton
                title="Logout"
                onPress={handleLogout}
                role="tutee"
              />
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default TuteeProfile;
