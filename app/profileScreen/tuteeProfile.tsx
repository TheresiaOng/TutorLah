import OrangeCard from "@/components/orangeCard";
import { useAuth } from "@/contexts/authContext";
import { auth, db } from "@/firebase";
import { router } from "expo-router";
import { useGlobalSearchParams } from "expo-router/build/hooks";
import { signOut } from "firebase/auth";
import { doc, DocumentData, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const TuteeProfile = () => {
  const [userDoc, setUserDoc] = useState<DocumentData | null>(null);
  const { userDocID, userRole } = useAuth();
  const { id: viewingId, role: viewingRole } = useGlobalSearchParams();
  const effectiveRole = viewingRole ?? userRole; // use viewingRole id available, otherwise use user's role
  const effectiveId = Array.isArray(viewingId) // Ensure effectiveId is always a string
    ? viewingId[0]
    : viewingId ?? userDocID;

  // if the user is not logged in, redirect to login page
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const path =
    effectiveRole === "tutor" ? "users/roles/tutors" : "users/roles/tutees";

  // retrieve user on screen document
  const docRef = doc(db, path, effectiveId);

  // retrieve user on screen document snapshot
  // The doc.data() can later be used to retrieve specific fields
  const docSnapshot = async () => {
    const doc = await getDoc(docRef);
    if (doc.exists()) {
      setUserDoc(doc.data());
    } else {
      console.log("home: No such document!");
    }
  };

  docSnapshot();

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
          <Text className="text-4xl w-3/5 pl-4 flex-wrap text-darkBrown font-asap-bold">
            {userDoc ? userDoc.name : "User"}
          </Text>
        </View>
      </View>

      {/* Personal Info Card */}
      <View className="h-5/6 w-full items-center">
        <ScrollView className="w-full px-4">
          <View className="items-center">
            <OrangeCard className="mt-4">
              <View className="flex-row items-start">
                <Text className="font-asap-semibold my-4 w-40 text-darkBrown">
                  Education Institute
                </Text>
                <Text className="font-asap-regular my-4 flex-shrink text-darkBrown">
                  : {userDoc?.educationInstitute}
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="font-asap-semibold my-4 w-40 text-darkBrown">
                  Education Level
                </Text>
                <Text className="font-asap-regular my-4 flex-shrink text-darkBrown">
                  : {userDoc?.educationLevel}
                </Text>
              </View>
            </OrangeCard>
          </View>

          {/* Following Section */}
          <View className="flex-col border-primaryOrange border-t-2 pt-2 mx-2 mt-4">
            <Text className="color-darkBrown text-2xl font-asap-bold">
              Following
            </Text>
            <View className="items-center">
              <Text className="p-8 font-asap-regular text-darkGray">
                You have no following right now
              </Text>
            </View>
          </View>

          {/* Listing Section */}
          <View className="flex-col border-primaryOrange border-t-2 pt-2 mx-2 mt-4">
            <Text className="color-darkBrown text-2xl font-asap-bold">
              Your Listing
            </Text>
            <View className="items-center">
              <Text className="p-8 font-asap-regular text-darkGray">
                You have no listing right now
              </Text>
            </View>

            {/* Logout Button */}
            {effectiveId === userDocID && (
              <View className="flex-row items-center justify-center">
                <TouchableOpacity
                  className={
                    "bg-secondaryOrange border-8 h-3/5 w-full border-secondaryOrange rounded-lg items-center justify-center"
                  }
                  onPress={handleLogout}
                >
                  <Text
                    className={`${"text-darkBrown"} font-asap-medium text-lg`}
                  >
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default TuteeProfile;
