import CustomSearchBar from "@/components/customSearchBar";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import { router, useLocalSearchParams } from "expo-router";
import { deleteDoc, doc } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TutorCard from "../homeScreen/tutorCard";

type Listing = {
  listId: string;
  role: "tutor" | "tutee";
  subjects: string;
};

const AllListingsTutor = () => {
  const { currentListings, viewingUserId } = useLocalSearchParams();
  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      return currentListings ? JSON.parse(currentListings as string) : [];
    } catch (err) {
      console.error("Failed to parse listings:", err);
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Listing[]>([]);
  const [searchFields, setSearchFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { userDoc } = useAuth();

  const isOwnProfile = !viewingUserId || viewingUserId === userDoc?.userId;

  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this listing? This action is irreversible.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const listingRef = doc(db, "listings", id);
              await deleteDoc(listingRef);
              console.log("Listing deleted successfully.");
              setListings((prev) => prev.filter((item) => item.listId !== id));
              setSearchResults((prev) =>
                prev.filter((item) => item.listId !== id)
              );
            } catch (error) {
              console.error("Error deleting listing:", error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white justify-center items-center">
      {/* Header */}
      <View
        className={`border-8 w-full justify-center items-center h-1/6 border-primaryBlue bg-primaryBlue`}
      >
        <View className="flex-row w-11/12 items-center inset-y-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="items-center h-full justify-center mr-2"
          >
            <Image
              className="w-10"
              resizeMode="contain"
              source={require("../../assets/images/arrowBack.png")}
            />
          </TouchableOpacity>
          <Text className={`text-white font-asap-bold text-3xl`}>
            {`All Listings [${listings.length}]`}
          </Text>
        </View>
      </View>
      {/* Card display logic */}
      <CustomSearchBar
        data={listings}
        searchFields={searchFields}
        onResult={setSearchResults}
        onQueryChange={setSearchQuery}
      />

      <View className="h-5/6 w-full justify-center items-center">
        {/* Loading indicator */}
        {loading && (
          <View className="items-center flex-col justify-center w-full h-full">
            <ActivityIndicator size="large" />
            <Text className="font-asap-medium mt-4">Loading listings...</Text>
          </View>
        )}

        {/* No search found text */}
        {searchQuery.trim() !== "" && searchResults.length === 0 ? (
          <Text className="text-center mb-12 text-gray text-lg font-asap-regular">
            No results found
          </Text>
        ) : (
          <FlatList
            data={searchQuery.trim() !== "" ? searchResults : listings}
            keyExtractor={(item) => item.listId} //every flatlist need a unique key id
            renderItem={({ item }) => (
              <View className="items-center px-4 w-screen">
                <TutorCard
                  item={item}
                  listId={item.listId}
                  {...(isOwnProfile && {
                    onDelete: (id: string) => handleDelete(id),
                  })}
                />
              </View>
            )}
            className="mt-12 pt-4 mb-4"
            ItemSeparatorComponent={() => <View className="h-4" />} // Adds vertical spacing
          />
        )}
      </View>
    </View>
  );
};

export default AllListingsTutor;

const styles = StyleSheet.create({});
