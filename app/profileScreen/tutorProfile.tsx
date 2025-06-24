import BlueCard from "@/components/blueCard";
import CardViewer from "@/components/cardViewer";
import CustomButton from "@/components/customButton";
import { useAuth } from "@/contexts/AuthProvider";
import { useChat } from "@/contexts/ChatProvider";
import { auth, db } from "@/firebase";
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
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

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
  const { userDoc } = useAuth();
  const { id: viewingUserId } = useGlobalSearchParams();
  const otherUserId = Array.isArray(viewingUserId)
    ? viewingUserId[0]
    : viewingUserId;

  const { client } = useChat();

  const userIdToView = otherUserId ?? userDoc?.userId;

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
  }, []);

  const handleFollow = async () => {
    const userId = currentDoc?.userId;
    const userRef = doc(db, "users", userId);
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

  return (
    <View className="flex-1 bg-white justify-center items-center">
      {/* Header */}
      <View className="border-8 border-primaryBlue bg-primaryBlue w-full justify-center items-center h-1/4">
        {/* Profile pic and Name */}
        <View className="flex-row w-11/12 items-center inset-y-8">
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

          <View className="w-20 h-20 mr-4 bg-white items-center rounded-full">
            <Image
              source={require("../../assets/images/hatLogo.png")}
              className="h-20 w-20 rounded-full mt-1 p-2"
            />
          </View>
          <View className="flex-1 flex-col items-start">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="text-4xl flex-wrap text-white font-asap-bold"
            >
              {currentDoc?.name || "User"}
            </Text>
            {isOwnProfile && (
              <CustomButton
                title="Edit Profile"
                onPress={() => router.push("/comingSoon")}
                role="tutor"
                extraClassName="h-11 inset-y-4"
              />
            )}
            {!isOwnProfile && userDoc?.role === "tutee" && (
              <CustomButton
                title={follow ? "Unfollow" : "Follow"}
                onPress={handleFollow}
                role="tutor"
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

          {/* Reviews Section */}
          <View>
            <View className="flex-col border-primaryBlue border-t-2 pt-2 mx-4 mt-4">
              <View className="flex-row items-center gap-2">
                <Text className="color-darkBlue text-2xl font-asap-bold">
                  Reviews
                </Text>
                <Text className="color-darkBlue text-2xl font-asap-bold">
                  [{reviewList.length}]
                </Text>
              </View>
              <View className="items-center w-full px-4 mb-4">
                {reviewList.length > 0 ? (
                  <CardViewer reviews={reviewList} />
                ) : (
                  <Text className="p-8 font-asap-regular text-darkGray">
                    No reviews yet.
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Listing Section */}
          <View className="flex-col border-primaryBlue border-t-2 pt-2 mx-4 mt-4">
            <Text className="color-darkBlue text-2xl font-asap-bold">
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
                role="tutor"
              />
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default TutorProfile;
