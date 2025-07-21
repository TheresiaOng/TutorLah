import { db } from "@/firebase";
import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MniProfile = {
  item: any;
};

const MiniProfile = ({ item }: MniProfile) => {
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

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

  return (
    <View className="flex-col items-center px-2 justify-center">
      <View className="bg-white border-primaryOrange items-center justify-center rounded-full">
        <Image
          source={
            profilePicUrl
              ? { uri: profilePicUrl }
              : require("@/assets/images/hatLogo.png")
          }
          className={`w-20 h-20 border-2 border-primaryOrange rounded-full ${
            !profilePicUrl && "pt-2 bg-whit "
          }`}
          resizeMode="cover"
        />
      </View>
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
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="text-darkBrown font-asap-bold text-lg"
        >
          {item.name.length > 10 ? `${item.name.slice(0, 10)}...` : item.name}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MiniProfile;

const styles = StyleSheet.create({});
