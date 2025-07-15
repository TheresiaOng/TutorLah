import { useAuth } from "@/contexts/AuthProvider";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { db } from "../../firebase";

import CustomSearchBar from "@/components/customSearchBar";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import NullScreen from "../nullScreen";
import TuteeCard from "./tuteeCard";
import TutorCard from "./tutorCard";

type Listing = {
  listId: string;
  role: "tutor" | "tutee";
  subjects: string;
};

const HomeScreen = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Listing[]>([]);
  const [searchFields, setSearchFields] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [subjectRanking, setSubjectRanking] = useState<Map<string, number>>(
    new Map()
  );
  const [loadingMatching, setLoadingMatching] = useState(false);

  const { userDoc } = useAuth();
  if (!userDoc) return <NullScreen />;
  
  // Supabase client setup
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

  useEffect(() => {
    const fetchMatchingSubjects = async () => {
      setLoadingMatching(true);
      console.log("Running match_subjects with embedding of", userDoc.name);

      const isTutor = userDoc?.role === "tutor";
      const userEmbedding = isTutor
        ? userDoc.embeddedSubjectToTeach
        : userDoc.embeddedSubjectToLearn;

      if (!userEmbedding) {
        setLoadingMatching(false); // <-- ADD THIS LINE
        return;
      }

      // call supabase table function to match subject based on users' preferences
      const { data, error } = await supabase.rpc("match_subjects", {
        user_embedding: userEmbedding,
        match_limit: 10, // take the top 10 subjects
        threshold: 0.5,
      });

      if (error) {
        console.error("Error calling match_subjects:", error);
        setLoadingMatching(false);
        return;
      }

      if (!data || data.length === 0) {
        console.warn(
          "No matched subjects found. Falling back to default sorting."
        );
        setSubjectRanking(new Map()); // reset to empty map = default fallback
        setLoadingMatching(false);
        return;
      }

      // rank each subject based on similarity / match
      const ranked = new Map<string, number>();
      (data as { name: string }[]).forEach((item, index) => {
        ranked.set(item.name.toLowerCase(), 10 - index);
      });

      setSubjectRanking(ranked);
      setLoadingMatching(false);
    };

    fetchMatchingSubjects();
  }, [userDoc]);
    
  useEffect(() => { // Fetching photo_url from Supabase
    const fetchData = async () => {
      if (!userDoc?.userId) return; // Ensure id is available
      const { data, error } = await supabase 
        .from("profiles")
        .select("photo_url")
        .eq("id", userDoc.userId)
        .single();
  
      if (error) {
        console.error("Error fetching photo_url:", error);
      } else {
        console.log("Photo URL:", data?.photo_url);
        setPhotoUrl(data?.photo_url || null); // Set photoUrl state
      }
    };
    fetchData();
  }, [userDoc]);

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

  // give each subject a score if it does not have a score, mark it 0
  // 0 means it will be displayed at the bottom
  const scoreListing = (subjects: string): number => {
    const subjectList = subjects.split(",").map((s) => s.trim().toLowerCase());

    const total = subjectList.reduce(
      (score, s) => score + (subjectRanking.get(s) || 0),
      0
    );

    return subjectList.length > 0 ? total / subjectList.length : 0;
  };

  // sort the listing based on its score
  // te higher the score, the higher the placement
  const sortedListings = useMemo(() => {
    if (searchQuery.trim() !== "") return searchResults;

    return [...listings].sort(
      (a, b) => scoreListing(b.subjects) - scoreListing(a.subjects)
    );
  }, [listings, searchQuery, searchResults, subjectRanking]);

  useEffect(() => {
    setListings((prev) => [...prev]); // Triggers FlatList re-render
  }, [subjectRanking]);

  return (
    <View className="flex-1 bg-white justify-center items-center">
      {/* Header */}
      {userDoc?.role === "tutor" ? (
        <View className="border-8 border-primaryBlue bg-primaryBlue w-full justify-center items-center h-60">
          <View className="flex-row w-11/12 items-center inset-y-8">
            <View className={`mr-4 items-center rounded-full${
                 photoUrl ? "h-20, w-20" : "h-20, w-20 bg-white"
               }`}>  
                  <Image
                    source={
                      photoUrl
                      ? { uri: photoUrl }
                      :require("../../assets/images/hatLogo.png")}
                      className={photoUrl ? "h-20 w-20 rounded-full" : "h-20 w-20 rounded-full mt-1 p-2"}
                   />
             </View>
            <Text
              numberOfLines={1} // Ensuring only one-line name display
              ellipsizeMode="tail" // Adding "..." at the end for the remainder of letters
              className="text-4xl w-4/5 pl-4 font-asap-bold color-white"
            >
              {userDoc?.name || "User"}
            </Text>
          </View>
        </View>
      ) : (
        <View className="border-8 border-primaryOrange bg-primaryOrange w-full justify-center items-center h-60">
          <View className="flex-row w-11/12 items-center inset-y-8">
            <View className={`mr-4 items-center rounded-full${
                photoUrl ? "h-20, w-20" : "h-20, w-20 bg-white"
               }`}>  
                  <Image
                     source={
                       photoUrl
                       ? { uri: photoUrl }
                       :require("../../assets/images/hatLogo.png")}
                       className={photoUrl ? "h-20 w-20 rounded-full" : "h-20 w-20 rounded-full mt-1 p-2"}
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
        {/* Loading indicator */}
        {loadingMatching && (
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
            data={sortedListings}
            keyExtractor={(item) => item.listId} //every flatlist need a unique key id
            renderItem={({ item }) => {
              return item.role === "tutee" ? (
                <View className="items-center w-screen">
                  <TuteeCard item={item} listId={item.listId} />
                </View>
              ) : (
                <View className="items-center w-screen">
                  <TutorCard item={item} listId={item.listId} />
                </View>
              );
            }}
            className="mt-16 mb-16"
            ItemSeparatorComponent={() => <View className="h-4" />} // Adds vertical spacing
          />
        )}
      </View>
    </View>
  );
};

export default HomeScreen;
