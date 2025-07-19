import BlueCard from "@/components/blueCard";
import CustomButton from "@/components/customButton";
import ReviewCard from "@/components/reviewCard";
import { useAuth } from "@/contexts/AuthProvider";
import { useChat } from "@/contexts/ChatProvider";
import { auth, db } from "@/firebase";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useGlobalSearchParams } from "expo-router/build/hooks";
import { signOut } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import TutorCard from "../homeScreen/tutorCard";
import NullScreen from "../nullScreen";

type Listing = {
  listId: string;
  role: "tutor" | "tutee";
};

type Review = {
  id: string;
  tuteeName: string;
  reviewText: string;
  ratings: number;
};

const TutorProfile = () => {
  const [currentListings, setCurrentListings] = useState<Listing[]>([]);
  const [currentDoc, setCurrentDoc] = useState<DocumentData | null>(null);
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [follow, setFollow] = useState<boolean>(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const { id: viewingUserId } = useGlobalSearchParams();
  const otherUserId = Array.isArray(viewingUserId)
    ? viewingUserId[0]
    : viewingUserId;
  const { userDoc } = useAuth();
  if (!userDoc) return <NullScreen />;

  const { client } = useChat();

  const userIdToView = otherUserId ?? userDoc?.userId;

  // Supabase client setup
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

  useEffect(() => {
    // Fetching photo_url from Supabase
    const fetchData = async () => {
      if (!userDoc?.userId) return; // Ensure id is available
      const { data, error } = await supabase
        .from("profiles")
        .select("photo_url")
        .eq("id", userDoc.userId)
        .single();

      if (error) {
        console.log("No photo uploaded yet, using default image");
      } else {
        console.log("Photo URL:", data?.photo_url);
        setPhotoUrl(data?.photo_url || null); // Set photoUrl state
      }
    };
    fetchData();
  }, [userDoc]);

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

  useEffect(() => {
    const fetchReviews = async () => {
      if (!currentDoc?.reviewIds || currentDoc.reviewIds.length === 0) {
        setReviewList([]);
        return;
      }

      try {
        const reviewPromises = currentDoc.reviewIds.map(
          async (reviewId: string) => {
            const reviewDoc = await getDoc(doc(db, "reviews", reviewId));
            if (reviewDoc.exists()) {
              return {
                id: reviewDoc.id,
                ...(reviewDoc.data() as Omit<Review, "id">),
              };
            }
            return null;
          }
        );

        const reviews = (await Promise.all(reviewPromises)).filter(
          Boolean
        ) as Review[];
        setReviewList(reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, [currentDoc]);

  const isOwnProfile = !viewingUserId || viewingUserId === userDoc?.userId;

  // if the user is not logged in, redirect to login page
  const handleLogout = async () => {
    await signOut(auth);
    await client.disconnectUser();
    router.replace("/");
  };

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!userIdToView || !userDoc?.userId) return;

      const followersDocRef = doc(
        db,
        "users",
        userIdToView,
        "followers",
        userDoc.userId
      );

      try {
        const docSnap = await getDoc(followersDocRef);
        setFollow(docSnap.exists());
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };

    checkFollowStatus();
  }, [userIdToView, userDoc]);

  const handleFollow = async () => {
    const userId = currentDoc?.userId;
    const followerId = userDoc?.userId;

    const followersDocRef = doc(db, "users", userId, "followers", followerId);
    const followingDocRef = doc(db, "users", followerId, "following", userId);

    if (!follow) {
      await setDoc(followersDocRef, {
        followedAt: new Date(),
      });
      await setDoc(followingDocRef, {
        followedAt: new Date(),
      });
      setFollow(true);
    } else {
      await deleteDoc(followersDocRef);
      await deleteDoc(followingDocRef);
      setFollow(false);
    }
  };

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
              setCurrentListings((prev) =>
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

  const handleShowMoreListings = () => {
    router.push({
      pathname: "/allListingsScreen/allListingsTutor",
      params: {
        currentListings: JSON.stringify(currentListings),
        viewingUserId,
      },
    });
  };

  const handleShowMoreReviews = () => {
    router.push({
      pathname: "/allReviewsScreen/allReviewsTutor",
      params: { currentReviews: JSON.stringify(reviewList) },
    });
  };

  return (
    <View className="flex-1 bg-white justify-center items-center">
      {/* Header */}
      <View className="border-8 border-primaryBlue bg-primaryBlue w-full justify-center items-center h-1/4">
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

          <View
            className={`mr-4 items-center justify-center rounded-full ${
              photoUrl ? "h-20 w-20" : "h-20 w-20 bg-white"
            } overflow-hidden`}
          >
            <Image
              source={
                photoUrl
                  ? { uri: photoUrl }
                  : require("../../assets/images/hatLogo.png")
              }
              className={`h-20 w-20 rounded-full border-2 border-white ${
                !photoUrl && "p-2 mt-2"
              }`}
              resizeMode="cover"
            />
          </View>
          <View className="flex-1 flex-col items-start">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="text-4xl flex-wrap inset-y-2 text-white font-asap-bold"
            >
              {currentDoc?.name || "User"}
            </Text>
            {isOwnProfile ? (
              <View className="flex-row inset-y-4 w-full justify-between">
                <View className="w-36">
                  <CustomButton
                    title="Edit Profile"
                    onPress={() =>
                      router.push("../editProfile/editTutorProfile")
                    }
                    role="tutor"
                  />
                </View>
                <View className="w-36">
                  <CustomButton
                    title="Logout"
                    onPress={handleLogout}
                    role="tutor"
                  />
                </View>
              </View>
            ) : (
              <View className="flex-row inset-y-4 w-full justify-between">
                <CustomButton
                  title={follow ? "Unfollow" : "Follow"}
                  onPress={handleFollow}
                  role="tutor"
                />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Personal Info Card */}
      <View className="h-5/6 w-full items-center">
        <ScrollView className="w-full mb-12">
          <View className="items-center w-full">
            <BlueCard className="mt-4">
              <View className="flex-row items-start">
                <Text className="font-asap-semibold my-4 w-40 text-darkBlue">
                  Education Institute
                </Text>
                <Text className="font-asap-regular my-4 flex-shrink text-darkBlue">
                  : {currentDoc?.educationInstitute}
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="font-asap-semibold my-4 w-40 text-darkBlue">
                  Education Level
                </Text>
                <Text className="font-asap-regular my-4 flex-shrink text-darkBlue">
                  : {currentDoc?.educationLevel}
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="font-asap-semibold my-4 w-40 text-darkBlue">
                  Achievements
                </Text>
                <Text className="font-asap-regular my-4 flex-shrink text-darkBlue">
                  : {currentDoc?.achievements}
                </Text>
              </View>
            </BlueCard>
          </View>

          {/* Review Section */}
          <View className="flex-col border-primaryBlue border-t-2 pt-2 mx-4 mt-4">
            <View className="flex-row justify-between">
              <Text className="color-darkBlue text-2xl font-asap-bold">
                {isOwnProfile
                  ? `Your Reviews [${reviewList.length}]`
                  : `Reviews [${reviewList.length}]`}
              </Text>
              {reviewList?.length > 3 && (
                <>
                  <View className="w-32">
                    <CustomButton
                      title="Show All"
                      onPress={handleShowMoreReviews}
                      role="tutor"
                      extraClassName="h-9"
                    />
                  </View>
                </>
              )}
            </View>
            <View className="items-center mb-4">
              {reviewList?.length > 0 ? (
                <>
                  <FlatList
                    horizontal
                    data={reviewList.slice(0, 3)}
                    keyExtractor={(item) => item.id} //every flatlist need a unique key id
                    renderItem={({ item }) => {
                      return (
                        <View className="items-center max-w-sm justify-center">
                          <ReviewCard item={item} />
                        </View>
                      );
                    }}
                    className="mt-2 p-2 mb-4 w-full"
                  />
                </>
              ) : (
                <Text className="p-8 font-asap-regular text-darkGray">
                  {isOwnProfile
                    ? "You have no review right now"
                    : "No review at the moment"}
                </Text>
              )}
            </View>
          </View>

          {/* Listing Section */}
          <View className="flex-col border-primaryBlue border-t-2 pt-2 mx-4 mt-4">
            <View className="flex-row justify-between">
              <Text className="color-darkBlue text-2xl font-asap-bold">
                {isOwnProfile
                  ? `Your Listings [${currentListings.length}]`
                  : `Listings [${currentListings.length}]`}
              </Text>
              {currentListings?.length > 3 && (
                <>
                  <View className="w-32">
                    <CustomButton
                      title="Show All"
                      onPress={handleShowMoreListings}
                      role="tutor"
                      extraClassName="h-9"
                    />
                  </View>
                </>
              )}
            </View>
            <View className="items-center mb-4">
              {currentListings?.length > 0 ? (
                <>
                  <FlatList
                    horizontal
                    data={currentListings.slice(0, 3)}
                    keyExtractor={(item) => item.listId} //every flatlist need a unique key id
                    renderItem={({ item }) => {
                      return (
                        <View className="items-center justify-center">
                          <TutorCard
                            item={item}
                            listId={item.listId}
                            {...(isOwnProfile && {
                              onDelete: (id) => handleDelete(id),
                            })}
                          />
                        </View>
                      );
                    }}
                    className="mt-2 p-2 mb-4 w-full"
                  />
                </>
              ) : (
                <Text className="p-8 font-asap-regular text-darkGray">
                  {isOwnProfile
                    ? "You have no listing right now"
                    : "No listing at the moment"}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default TutorProfile;
