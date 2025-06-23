import { useAuth } from "@/contexts/AuthProvider";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { db } from "../../firebase";

import CustomSearchBar from "@/components/customSearchBar";
import TuteeCard from "./tuteeCard";
import TutorCard from "./tutorCard";

type Listing = {
  listId: string;
  role: "tutor" | "tutee";
};

const HomeScreen = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Listing[]>([]);
  const [searchFields, setSearchFields] = useState<string[]>([]);
  const { userDoc } = useAuth();

  useEffect(() => {
    let listingsQuery = query(collection(db, "listings")); // Query to fetch all listings
    // Listen for real-time updates to the listings collection
    // This will automatically update the listings state whenever there are changes in the database

    // To filter listings based on roles only
    const selectedRole = searchFields
      .filter((field) => field.startsWith("role:"))
      .map((field) => field.split(":")[1]);

    if (selectedRole.includes("tutor") && selectedRole.includes("tutee")) {
    } else if (selectedRole.includes("tutor")) {
      listingsQuery = query(
        collection(db, "listings"),
        where("role", "==", "tutor")
      );
    } else if (selectedRole.includes("tutee")) {
      listingsQuery = query(
        collection(db, "listings"),
        where("role", "==", "tutee")
      );
    }

    const unsubscribe = onSnapshot(listingsQuery, (snapshot) => {
      // each specific document in the collection
      const fetchedListings: Listing[] = snapshot.docs.map((doc) => ({
        listId: doc.id,
        ...(doc.data() as Omit<Listing, "listId">),
      }));
      setListings(fetchedListings);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [searchFields]);

  return (
    <View className="flex-1 bg-white justify-center items-center">
      {/* Header */}
      {userDoc?.role === "tutor" ? (
        <View className="border-8 border-primaryBlue bg-primaryBlue w-full justify-center items-center h-60">
          <View className="flex-row w-11/12 items-center inset-y-8">
            <View className="w-20 h-20 bg-white items-center rounded-full">
              <Image
                source={require("../../assets/images/hatLogo.png")}
                className="h-20 w-20 rounded-full mt-1 p-2"
              />
            </View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="text-4xl w-4/5 pl-4 font-asap-bold color-white"
            >
              {userDoc?.name || "User"}
            </Text>
          </View>
        </View>
      ) : (
        <View className="border-8 border-primaryOrange bg-primaryOrange w-full justify-center items-center h-60">
          <View className="flex-row w-11/12 items-center inset-y-8">
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
      <CustomSearchBar
        data={listings}
        searchFields={searchFields}
        onResult={setSearchResults}
        onQueryChange={setSearchQuery}
        onSearchFieldsChange={setSearchFields}
      />

      <View className="h-5/6 w-full justify-center items-center">
        {searchQuery.trim() !== "" && searchResults.length === 0 ? (
          <Text className="text-center mt-16 text-gray text-lg font-asap-regular">
            No results found
          </Text>
        ) : (
          <FlatList
            data={searchQuery.trim() === "" ? listings : searchResults} //get everything from listings or searchResults
            keyExtractor={(item) => item.listId} //every flatlist need a unique key id
            renderItem={({ item }) => {
              return item.role === "tutee" ? (
                <View className="items-center w-full">
                  <TuteeCard item={item} listId={item.listId} />
                </View>
              ) : (
                <View className="items-center w-screen">
                  <TutorCard item={item} listId={item.listId} />
                </View>
              );
            }}
            className="mt-16"
            ItemSeparatorComponent={() => <View className="h-6" />} // Adds vertical spacing
          />
        )}
      </View>
    </View>
  );
};

export default HomeScreen;
