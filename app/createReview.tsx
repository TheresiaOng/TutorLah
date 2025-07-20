import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateReview() {
  const { paidTo, paidBy, tutorId, paymentId } = useLocalSearchParams();
  const [reviewText, setReviewText] = useState("");
  const [ratings, setRatings] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [reviewCount, setReviewCount] = useState(0);
  const [totalRating, setTotalRating] = useState(0);
  const { userDoc } = useAuth();

  const handleSubmit = async () => {
    if (!reviewText.trim() || !ratings) {
      setErrorMsg("Please write a review and give a rating before submitting");
      return;
    }

    if (
      !ratings ||
      isNaN(Number(ratings)) ||
      Number(ratings) < 1 ||
      Number(ratings) > 5
    ) {
      setErrorMsg("Please enter a valid rating between 1 and 5");
      return;
    }

    setErrorMsg("");
    // Show confirmation alert
    Alert.alert(
      "Confirm Review Submission",
      "Your name will be public and your review must not contain any offensive language.\n\nAre you sure you want to post this review?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Submit",
          style: "default",
          onPress: async () => {
            try {
              const reviewDoc = await addDoc(collection(db, "reviews"), {
                reviewText: reviewText.trim(),
                tuteeName: paidBy,
                ratings: ratings.trim(),
                paymentId,
                tutorId,
              });

              const userDocRef = doc(
                db,
                "users",
                typeof tutorId === "string"
                  ? tutorId
                  : Array.isArray(tutorId)
                  ? tutorId[0]
                  : ""
              );

              await updateDoc(userDocRef, {
                reviewIds: arrayUnion(reviewDoc.id),
              });

              await updateDoc(doc(db, "users", userDoc.userId), {
                reviewedPaymentIds: arrayUnion(paymentId),
              });

              const tutorDocRef = doc(db, "users", typeof tutorId === "string" ? tutorId : tutorId[0]);
              const tutorDocSnap = await getDoc(tutorDocRef);

              if (tutorDocSnap.exists()) {
                const reviewIds = tutorDocSnap.data().reviewIds || [];
                let count = reviewIds.length;
                let sum = 0;

              for (const reviewId of reviewIds) {
                  const reviewSnap = await getDoc(doc(db, "reviews", reviewId));
                  if (reviewSnap.exists()) {
                    const ratingStr = reviewSnap.data().ratings;
                    const ratingNum = parseFloat(ratingStr);
                    if (!isNaN(ratingNum)) sum += ratingNum;
                  }
              }
              setReviewCount(count);
              setTotalRating(sum);

              const listingsRef = collection(db, "listings");
              const q = query(listingsRef, where("userId", "==", tutorId));
              const querySnapshot = await getDocs(q);
              const updatePromises = querySnapshot.docs.map(async (docSnap) => {
              const listingRef = doc(db, "listings", docSnap.id);
              return updateDoc(listingRef, {
                reviewCount: Number(count),
                totalRating: Number(sum),
              });
            });
            await Promise.all(updatePromises);
            }
              Alert.alert("Success", "Review submitted successfully!");
              router.back();
            } catch (error) {
              console.error("Error submitting review: ", error);
              Alert.alert(
                "Error",
                "Failed to submit review. Please try again."
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.page}>
      {/* Header */}
      <View className="border-8 w-full items-center h-1/6 border-primaryOrange bg-primaryOrange">
        {/* Cancel Button */}

        <View className="flex-row w-11/12 items-center justify-start inset-y-6">
          <TouchableOpacity
            className="items-center h-full justify-center mt-3 mr-2"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Image
              source={require("../assets/images/cancel.png")}
              className="w-10"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.header}>Create Review</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollView}
      >
        <Text style={styles.label}>Tutor Name</Text>
        <TextInput
          style={styles.disabledInput}
          value={paidTo as string}
          editable={false}
        />

        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.disabledInput}
          value={paidBy as string}
          editable={false}
        />

        <Text style={styles.label}>Ratings</Text>
        <TextInput
          style={styles.input}
          value={ratings}
          onChangeText={setRatings}
          placeholder="Enter ratings out of 5"
          placeholderTextColor="#5d5d5d"
          keyboardType="numeric"
          maxLength={1}
        />

        <Text style={styles.label}>Leave Review</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={6}
          value={reviewText}
          onChangeText={setReviewText}
          placeholder="Type your feedback here..."
          placeholderTextColor="#5d5d5d"
        />
      </ScrollView>
      {errorMsg !== "" && (
        <Text
          style={{
            color: "red",
            textAlign: "center",
            marginTop: 20,
            fontFamily: "Asap",
            fontSize: 12,
          }}
        >
          {errorMsg}
        </Text>
      )}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 28,
    fontFamily: "Asap-Bold",
    color: "#8B402E",
    textAlign: "left",
    marginTop: 10,
  },
  container: {
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    marginTop: 12,
  },
  label: {
    fontSize: 16,
    fontFamily: "Asap-Regular",
    color: "#E9901B",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderColor: "#8e8e93",
    borderWidth: 2,
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
    color: "#000",
    fontFamily: "Asap-Regular",
    marginBottom: 12,
  },
  disabledInput: {
    backgroundColor: "#ebebeb",
    borderColor: "#8e8e93",
    borderWidth: 2,
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
    color: "#000",
    fontFamily: "Asap-Regular",
    marginBottom: 12,
  },
  textArea: {
    height: 150,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#FFD256",
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 35,
    marginVertical: 20,
    marginHorizontal: 24,
    alignItems: "center",
  },
  submitText: {
    color: "#8B402E",
    fontSize: 18,
    fontFamily: "Asap-Bold",
  },
});
