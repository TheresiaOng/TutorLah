import CardViewer from "@/components/cardViewer";
import CustomButton from "@/components/customButton";
import MiniProfile from "@/components/miniProfile";
import OrangeCard from "@/components/orangeCard";
import { useAuth } from "@/contexts/AuthProvider";
import { auth, db } from "@/firebase";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useGlobalSearchParams } from "expo-router/build/hooks";
import { signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StreamChat } from "stream-chat";
import NullScreen from "../nullScreen";

type following = {
  userId: string;
  name: string;
  role: "tutor" | "tutee";
};

type Listing = {
  listId: string;
  role: "tutor" | "tutee";
};

const TuteeProfile = () => {
  const [following, setFollowing] = useState<following[]>([]);
  const [currentListings, setCurrentListings] = useState<Listing[]>([]);
  const [currentDoc, setCurrentDoc] = useState<any>(null);
  const { id: viewingUserId } = useGlobalSearchParams();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const otherUserId = Array.isArray(viewingUserId)
    ? viewingUserId[0]
    : viewingUserId;
  const { userDoc } = useAuth();

  // Supabase client setup
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

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

  if (!userDoc) return <NullScreen />;

  function getStreamApiKey(): string {
    const key = Constants.expoConfig?.extra?.streamApiKey;
    if (!key) {
      throw new Error("Missing STREAM_API_KEY in app.config.js or .env");
    }
    return key;
  }

  const client = StreamChat.getInstance(getStreamApiKey());

  const userIdToView = otherUserId ?? userDoc?.userId;

  useEffect(() => {
    const fetchProfileDoc = async () => {
      if (!userIdToView) return;
      if (userIdToView === userDoc?.userId) {
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
  }, [viewingUserId, userDoc, userIdToView]);

  // Fetching currently viewed user's following list
  useEffect(() => {
    if (!userIdToView) return;

    const followingRef = collection(db, "users", userIdToView, "following");

    const unsubscribe = onSnapshot(followingRef, async (snapshot) => {
      const userIds = snapshot.docs.map((doc) => doc.id);

      const userDocPromises = userIds.map((id) => getDoc(doc(db, "users", id)));

      const userDocs = await Promise.all(userDocPromises);

      const fetchedFollowing = userDocs
        .filter((docSnap) => docSnap.exists())
        .map((docSnap) => ({
          userId: docSnap.id,
          ...(docSnap.data() as { name: string; role: "tutor" | "tutee" }),
        }));

      setFollowing(fetchedFollowing);
    });

    return () => unsubscribe();
  }, [userIdToView]);

  // Fetching currently viewed user's listings
  useEffect(() => {
    if (!userIdToView) return;

    let listingsQuery = query(
      collection(db, "listings"),
      where("userId", "==", userIdToView) // Filter listings by the userId to view
      // This will fetch listings only for the user whose profile is being viewed
    );

    const unsubscribe = onSnapshot(listingsQuery, (snapshot) => {
      // each specific document in the collection
      const fetchedListings: Listing[] = snapshot.docs.map((doc) => ({
        listId: doc.id,
        ...(doc.data() as Omit<Listing, "listId">),
      }));
      setCurrentListings(fetchedListings);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [viewingUserId, userDoc, userIdToView]);

  const isOwnProfile = !viewingUserId || viewingUserId === userDoc?.userId;

  // if the user is not logged in, redirect to login page
  const handleLogout = async () => {
    await signOut(auth);
    await client.disconnectUser();
    router.push("/");
  };

  return (
    <View className="flex-1 bg-white justify-center items-center">
      {/* Header */}
      <View className="border-8 border-primaryOrange bg-primaryOrange w-full justify-center items-center h-1/4">
        {/* Profile pic and Name */}
        <View className="flex-row w-11/12 items-center inset-y-8">
          {!isOwnProfile && (
            <TouchableOpacity
              onPress={() => router.back()}
              className="items-center justify-center mr-2"
            >
              <Image
                className="w-10"
                resizeMode="contain"
                source={require("../../assets/images/arrowBack.png")}
              />
            </TouchableOpacity>
          )}

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
          <View className="flex-1 flex-col items-start">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="text-4xl flex-wrap text-darkBrown font-asap-bold"
            >
              {currentDoc?.name || "User"}
            </Text>
            {isOwnProfile && (
              <CustomButton
                title="Edit Profile"
                onPress={() => router.push("../editProfile/editTuteeProfile")}
                role="tutee"
                extraClassName="h-11 inset-y-4"
              />
            )}
          </View>
        </View>
      </View>

      {/* Personal Info Card */}
      <View className="h-5/6 w-full items-center">
        <ScrollView className="w-full mb-12">
          <View className="items-center w-full">
            <OrangeCard className="mt-4">
              <View className="flex-row items-start">
                <Text className="font-asap-semibold my-4 w-40 text-darkBrown">
                  Education Institute
                </Text>
                <Text className="font-asap-regular my-4 flex-shrink text-darkBrown">
                  : {currentDoc?.educationInstitute}
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="font-asap-semibold my-4 w-40 text-darkBrown">
                  Education Level
                </Text>
                <Text className="font-asap-regular my-4 flex-shrink text-darkBrown">
                  : {currentDoc?.educationLevel}
                </Text>
              </View>
            </OrangeCard>
          </View>

          {/* Following Section */}
          {isOwnProfile && (
            <View className="flex-col border-primaryOrange border-t-2 pt-2 mx-4 mt-4">
              <Text className="color-darkBrown text-2xl font-asap-bold">
                Following [{following.length}]
              </Text>
              <View className="items-center mb-4">
                {following.length > 0 ? (
                  <FlatList
                    data={following}
                    keyExtractor={(item) => item.userId}
                    renderItem={({ item }) => {
                      return (
                        <View className="items-center justify-center">
                          <MiniProfile item={item} />
                        </View>
                      );
                    }}
                    horizontal={true}
                    className="w-full mt-6"
                    ItemSeparatorComponent={() => <View className="w-4" />}
                  />
                ) : (
                  <Text className="mt-4 font-asap-regular text-darkGray">
                    No following at the moment
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Listing Section */}
          <View className="flex-col border-primaryOrange border-t-2 pt-2 mx-4 mt-4">
            <Text className="color-darkBrown text-2xl font-asap-bold">
              {isOwnProfile
                ? `Your Listings [${currentListings.length}]`
                : `Listings [${currentListings.length}]`}
            </Text>
            <View className="items-center mb-4">
              {currentListings?.length > 0 ? (
                <CardViewer listings={currentListings} />
              ) : (
                <Text className="p-8 font-asap-regular text-darkGray">
                  {isOwnProfile
                    ? "You have no listing right now"
                    : "No listing at the moment"}
                </Text>
              )}
            </View>

            {/* Logout Button */}
            {isOwnProfile && (
              <CustomButton
                title="Logout"
                onPress={handleLogout}
                role="tutee"
              />
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default TuteeProfile;
