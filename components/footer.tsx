import { useAuth } from "@/contexts/authContext";
import { router, useGlobalSearchParams, usePathname } from "expo-router";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";

const Footer = () => {
  const { userDocID, userRole } = useAuth();

  // Get the current pathname
  const pathname = usePathname();
  const { id: viewingId, role: viewingRole } = useGlobalSearchParams();
  const effectiveRole = viewingRole ?? userRole; // use viewingRole id available, otherwise use user's role
  const effectiveId = viewingId ?? userDocID; // use viewingId id available, otherwise use user's Id

  const handleHome = () => {
    if (pathname !== "/homeScreen/home") {
      router.push("/homeScreen/home");
    }
  };

  const handleCreate = () => {
    if (pathname !== "/createListingScreen/createListing") {
      router.push({
        pathname: "/createListingScreen/createListing",
        params: { id: userDocID, userRole },
      });
    }
  };

  const handleProfile = () => {
    if (
      effectiveId !== userDocID ||
      (pathname !== "/profileScreen/tuteeProfile" &&
        pathname !== "/profileScreen/tutorProfile")
    ) {
      const profilePath =
        userRole === "tutor"
          ? "/profileScreen/tutorProfile"
          : "/profileScreen/tuteeProfile";
      router.push({
        pathname: profilePath,
        params: { id: userDocID, userRole },
      });
    }
  };

  return (
    <View
      className={
        effectiveRole === "tutor"
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
                ? effectiveRole === "tutor"
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
                ? effectiveRole === "tutor"
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
              pathname.startsWith("/profileScreen") && effectiveId === userDocID
                ? effectiveRole === "tutor"
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
