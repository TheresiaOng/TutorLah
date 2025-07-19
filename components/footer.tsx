import NullScreen from "@/app/nullScreen";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";

const Footer = () => {
  const [currentDoc, setCurrentDoc] = useState<any>(null);
  const { userDoc } = useAuth();

  // Get the current pathname
  const pathname = usePathname();
  const { id: viewingUserId } = useGlobalSearchParams();
  const otherUserId = Array.isArray(viewingUserId)
    ? viewingUserId[0]
    : viewingUserId;

  useEffect(() => {
    const fetchProfileDoc = async () => {
      const userIdToView = otherUserId ?? userDoc?.userId;
      if (!userIdToView) return;
      if (userIdToView == userDoc?.userId) {
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

  if (!currentDoc) {
    return <NullScreen />;
  }

  const isOwnProfile = !currentDoc || currentDoc?.userId === userDoc?.userId;

  const handleHome = () => {
    if (pathname !== "/homeScreen/home") {
      router.replace("/homeScreen/home");
    }
  };

  const handleChat = () => {
    if (pathname !== "/chatScreen/chatListScreen") {
      router.replace("/chatScreen/chatListScreen");
    }
  };

  const handleCreate = () => {
    if (pathname !== "/createListingScreen/tuteeCreateListing" &&
        pathname !== "/createListingScreen/tutorCreateListing") 
        {
      // Used push because user might navigate back
      const createPath = 
      userDoc.role === "tutor"
          ? "/createListingScreen/tutorCreateListing"
          : "/createListingScreen/tuteeCreateListing";
      router.push({
        pathname: createPath,
      });
    }
  };

  const handleCalendar = () => {
    if (
      !isOwnProfile ||
      (pathname !== "/scheduleScreen/tuteeSchedule" &&
        pathname !== "/scheduleScreen/tutorSchedule")
    ) {
      const schedulePath =
        userDoc.role === "tutor"
          ? "/scheduleScreen/tutorSchedule"
          : "/scheduleScreen/tuteeSchedule";
      router.replace({
        pathname: schedulePath,
      });
    }
  };

  const handleProfile = () => {
    if (
      !isOwnProfile ||
      (pathname !== "/profileScreen/tuteeProfile" &&
        pathname !== "/profileScreen/tutorProfile")
    ) {
      const profilePath =
        userDoc.role === "tutor"
          ? "/profileScreen/tutorProfile"
          : "/profileScreen/tuteeProfile";
      router.replace({
        pathname: profilePath,
      });
    }
  };

  return (
    <View
      className={
        currentDoc.role === "tutor"
          ? "bg-primaryBlue border-8 border-primaryBlue w-full pt-4 items-center h-1/8"
          : "bg-primaryOrange border-8 border-primaryOrange w-full pt-4 items-center h-1/8"
      }
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 }, // top shadow
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center h-3/5 gap-6">
        <TouchableOpacity onPress={() => handleHome()}>
          <Image
            source={require("../assets/images/home.png")}
            className={`h-14 w-14 rounded-full p-3 ${
              pathname === "/homeScreen/home"
                ? currentDoc?.role === "tutor"
                  ? "bg-darkPrimaryBlue"
                  : "bg-darkPrimaryOrange"
                : ""
            }`}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCalendar}>
          <Image
            source={require("../assets/images/calendar.png")}
            className={`h-14 w-14 rounded-full p-3 ${
              pathname.startsWith("/scheduleScreen")
                ? currentDoc?.role === "tutor"
                  ? "bg-darkPrimaryBlue"
                  : "bg-darkPrimaryOrange"
                : ""
            }`}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleCreate()}>
          <Image
            source={require("../assets/images/plus.png")}
            className={`h-14 w-14 rounded-full p-3 ${
              pathname === "/createListingScreen/createListing"
                ? currentDoc?.role === "tutor"
                  ? "bg-darkPrimaryBlue"
                  : "bg-darkPrimaryOrange"
                : ""
            }`}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleChat}>
          <Image
            source={require("../assets/images/chatBubble.png")}
            className={`h-14 w-14 rounded-full p-3 ${
              pathname.startsWith("/chatScreen")
                ? currentDoc?.role === "tutor"
                  ? "bg-darkPrimaryBlue"
                  : "bg-darkPrimaryOrange"
                : ""
            }`}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleProfile}>
          <Image
            source={require("../assets/images/profile.png")}
            className={`h-14 w-14 rounded-full p-3 ${
              pathname.startsWith("/profileScreen") && isOwnProfile
                ? currentDoc?.role === "tutor"
                  ? "bg-darkPrimaryBlue"
                  : "bg-darkPrimaryOrange"
                : ""
            }`}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Footer;