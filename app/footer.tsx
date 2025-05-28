import { auth } from "@/firebase";
import { router, usePathname } from "expo-router";
import { signOut } from "firebase/auth";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const Footer = () => {
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

  return (
    <View
      className="bg-primary border-8 border-primary rounded-xl w-full items-center h-1/6"
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
          className="bg-secondary border-8 h-4/6 border-secondary rounded-lg justify-center"
          onPress={handleLogout}
        >
          <Text className="text-black text-lg">Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity>
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
