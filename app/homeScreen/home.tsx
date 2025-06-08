import { useAuth } from "@/contexts/authContext";
import { collection, doc, onSnapshot, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { db } from "../../firebase";

import TuteeCard from "./tuteeCard";
import TutorCard from "./tutorCard";

type Listing = {
  listId: string;
  userRole: "tutor" | "tutee";
};

const HomeScreen = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const { userDocID, userRole, userDoc } = useAuth();

  // retrieve collection path based on user's role
  const path =
    userRole === "tutor" ? "users/roles/tutors" : "users/roles/tutees";

  // retrieve user's document
  const docRef = doc(db, path, userDocID);

  useEffect(() => {
    const listingsQuery = query(collection(db, "listings"));

    const unsubscribe = onSnapshot(listingsQuery, (snapshot) => {
      const fetchedListings: Listing[] = snapshot.docs.map((doc) => ({
        listId: doc.id,
        ...(doc.data() as Omit<Listing, "listId">),
      }));
      setListings(fetchedListings);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  return (
    <View className="flex-1 bg-white justify-center items-center">
      {/* Header */}
      {userRole === "tutor" ? (
        <View className="border-8 border-primaryBlue bg-primaryBlue w-full justify-center items-center h-1/4">
          <View className="flex-row w-11/12 items-center inset-y-6">
            <View className="w-20 h-20 bg-white items-center rounded-full">
              <Image
                source={require("../../assets/images/hatLogo.png")}
                className="h-20 w-20 rounded-full mt-1 p-2"
              />
            </View>
            <Text className="text-4xl w-4/5 pl-4 font-asap-bold color-white">
              {userDoc ? userDoc.name : "User"}
            </Text>
          </View>
        </View>
      ) : (
        <View className="border-8 border-primaryOrange bg-primaryOrange w-full justify-center items-center h-1/4">
          <View className="flex-row w-11/12 items-center inset-y-6">
            <View className="w-20 h-20 bg-white items-center rounded-full">
              <Image
                source={require("../../assets/images/hatLogo.png")}
                className="h-20 w-20 rounded-full mt-1 p-2"
              />
            </View>
            <Text className="text-4xl w-4/5 pl-4 color-darkBrown font-asap-bold">
              {userDoc ? userDoc.name : "User"}
            </Text>
          </View>
        </View>
      )}
      {/* Card display logic */}
      <View className="h-5/6 w-full items-center">
        <FlatList
          data={listings}
          keyExtractor={(item) => item.listId}
          renderItem={({ item }) => {
            if (item.listId === userDocID) return null; // skip user's card

            return item.userRole === "tutee" ? (
              <TuteeCard item={item} listId={item.listId} />
            ) : (
              <TutorCard item={item} listId={item.listId} />
            );
          }}
          className="m-6"
          ItemSeparatorComponent={() => <View className="h-6" />} // Adds vertical spacing
        />
      </View>
    </View>
  );
};

export default HomeScreen;
