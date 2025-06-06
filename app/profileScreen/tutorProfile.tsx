import BlueCard from "@/components/blueCard";
import { db } from "@/firebase";
import { router } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import { doc, DocumentData, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Footer from "../../components/footer";

const TutorProfile = () => {
  const params = useSearchParams();
  const id = params.get("id") as string;
  const role = params.get("role") as "tutor" | "tutee";
  const [userDoc, setUserDoc] = useState<DocumentData | null>(null);

  // retrieve collection path based on user's role
  const path = role === "tutor" ? "users/roles/tutors" : "users/roles/tutees";

  // retrieve user's document
  const docRef = doc(db, path, id);

  // retrieve user's document snapshot
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
      <View className="border-8 border-primaryBlue bg-primaryBlue w-full justify-center items-center h-1/4">
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
          <Text className="text-4xl w-3/5 pl-4 flex-wrap text-white font-asap-bold">
            {userDoc ? userDoc.name : "User"}
          </Text>
        </View>
      </View>

      {/* Personal Info Card */}
      <View className="h-4/6 w-full items-center">
        <ScrollView className="w-full px-4">
          <BlueCard className="mt-4">
            <View className="flex-row items-start">
              <Text className="font-asap-semibold my-4 w-40 text-darkPrimaryBlue">
                Education Institute
              </Text>
              <Text className="font-asap-regular my-4 flex-shrink text-darkPrimaryBlue">
                : {userDoc?.educationInstitute}
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="font-asap-semibold my-4 w-40 text-darkPrimaryBlue">
                Education Level
              </Text>
              <Text className="font-asap-regular my-4 flex-shrink text-darkPrimaryBlue">
                : {userDoc?.educationLevel}
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="font-asap-semibold my-4 w-40 text-darkPrimaryBlue">
                Achievements
              </Text>
              <Text className="font-asap-regular my-4 flex-shrink text-darkPrimaryBlue">
                : {userDoc?.achievements}
              </Text>
            </View>
          </BlueCard>

          {/* Reviews Section */}
          <View className="flex-col border-darkPrimaryBlue border-t-2 pt-2 mx-2 mt-4">
            <Text className="color-darkPrimaryBlue text-2xl font-asap-bold">
              Reviews
            </Text>
            <View className="flex-row gap-2">
              <Text className="font-asap-semibold">5</Text>
              <Text className="text-xl -inset-y-1 color-primaryOrange">
                ★ ★ ★ ★ ★
              </Text>
            </View>
            <View className="items-center">
              <BlueCard className="w-11/12">
                <View>
                  <Text className="font-asap-semibold text-darkPrimaryBlue">
                    Harry Potter
                  </Text>
                  <Text className="color-primaryOrange">★ ★ ★ ★ ★</Text>
                  <Text className="mt-2 font-asap-regular text-darkPrimaryBlue">
                    "Amazing teacher 😊🪄"
                  </Text>
                </View>
              </BlueCard>
            </View>
          </View>

          {/* Listing Section */}
          <View className="flex-col border-darkPrimaryBlue border-t-2 pt-2 mx-2 mt-4">
            <Text className="color-darkPrimaryBlue text-2xl font-asap-bold">
              Your Listing
            </Text>
            <View className="items-center">
              <Text className="p-8 font-asap-regular text-darkGray">
                You have no listing right now
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {role && <Footer id={id} role={role} />}
    </View>
  );
};

export default TutorProfile;
