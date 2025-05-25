import { useAuth } from "@/contexts/authContext";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../firebase";

const HomeScreen = () => {
  const [name, setName] = useState("User");
  const { userDocID, userRole } = useAuth();

  // if the user is not logged in, redirect to login page
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // retrieve collection path based on user's role
  const path =
    userRole === "tutor" ? "users/roles/tutors" : "users/roles/tutees";

  // retrieve user's document
  const docRef = doc(db, path, userDocID);

  // retrieve user's document snapshot
  // The doc.data() can later be used to retrieve specific fields
  const docSnapshot = async () => {
    const doc = await getDoc(docRef);
    if (doc.exists()) {
      setName(doc.data().name);
    } else {
      console.log("No such document!");
    }
  };

  docSnapshot();

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-6xl color-primary font-bold">Home Screen</Text>
      <Text>Welcome back, {name}!</Text>
      <TouchableOpacity
        className="bg-primary p-4 rounded-lg mt-4"
        onPress={handleLogout}
      >
        <Text className="text-black text-lg">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
