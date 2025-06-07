import { useAuth } from "@/contexts/authContext";
import { auth } from "@/firebase";
import { router, usePathname } from "expo-router";
import { signOut } from "firebase/auth";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type footerProps = {
  id: string;
  role: "tutor" | "tutee";
};

const Footer = ({ id, role }: footerProps) => {
  const { userDocID } = useAuth();
  // if the user is not logged in, redirect to login page
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // Get the current pathname
  const pathname = usePathname();

  const handleHome = () => {
    if (pathname !== "/homeScreen/home") {
      router.push("/homeScreen/home");
    }
  };

  const handleProfile = () => {
    if (
      id !== userDocID ||
      (pathname !== "/profileScreen/tuteeProfile" &&
        pathname !== "/profileScreen/tutorProfile")
    ) {
      router.push({
        pathname: `/profileScreen/${role}Profile`,
        params: { id: userDocID, role },
      });
    }
  };

  return (
    <View
      className={
        role === "tutor"
          ? "bg-primaryBlue border-8 border-primaryBlue rounded-xl w-full items-center h-1/6"
          : "bg-primaryOrange border-8 border-primaryOrange rounded-xl w-full items-center h-1/6"
      }
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 }, // top shadow
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center h-3/5 gap-8">
        <TouchableOpacity onPress={() => handleHome()}>
          <Image
            source={require("../assets/images/home.png")}
            className="h-10 w-10"
          />
        </TouchableOpacity>
        <TouchableOpacity
          className={
            role === "tutor"
              ? "bg-secondaryBlue border-8 h-4/6 border-secondaryBlue rounded-lg justify-center"
              : "bg-secondaryOrange border-8 h-4/6 border-secondaryOrange rounded-lg justify-center"
          }
          onPress={handleLogout}
        >
          <Text
            className={`${
              role == "tutor" ? "text-darkPrimaryBlue" : "text-darkBrown"
            } font-asap-medium text-lg`}
          >
            Logout
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleProfile}>
          <Image
            source={require("../assets/images/profile.png")}
            className="h-10 w-10"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Footer;
