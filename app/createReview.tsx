import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";
import React, { useState } from "react";
import {
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
  const { userDoc } = useAuth();

  const handleSubmit = async () => {
    if (!reviewText.trim()) {
      alert("Please write a review before submitting.");
      return;
    }

    try {
      const reviewDoc = await addDoc(collection(db, "reviews"), {
        reviewText: reviewText.trim(),
        tuteeName: paidBy,
        ratings: ratings.trim(),
        paymentId,
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

      alert("Review submitted successfully!");
      router.back();
    } catch (error) {
      console.error("Error submitting review: ", error);
      alert("Failed to submit review. Please try again.");
    }
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
          style={styles.input}
          value={paidTo as string}
          editable={false}
        />

        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          value={paidBy as string}
          editable={false}
        />

        <Text style={styles.label}>Ratings</Text>
        <TextInput
          style={styles.input}
          value={ratings}
          onChangeText={setRatings}
          placeholder="Enter ratings out of 5"
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
        />
      </ScrollView>
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
    fontWeight: "bold",
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
    color: "#F79824",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#eee",
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
    color: "#000",
  },
  textArea: {
    height: 150,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#FFD256",
    borderRadius: 12,
    paddingVertical: 12,
    marginVertical: 20,
    marginHorizontal: 24,
    alignItems: "center",
  },
  submitText: {
    color: "#8B402E",
    fontSize: 18,
    fontWeight: "bold",
  },
});
