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
  View
} from "react-native";

export default function CreateReview() {
  const { paidTo, paidBy, tutorId } = useLocalSearchParams();
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = async () => {
    if (!reviewText.trim()) {
      alert("Please write a review before submitting.");
      return;
    }

    try {
      const reviewDoc = await addDoc(collection(db, "reviews"), {
        reviewText: reviewText.trim(),
        tuteeName: paidBy,
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
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Create Reviews</Text>
        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Image
            source={require("../assets/images/cancel.png")}
            style={[styles.cancelIcon, { marginBottom: 10 }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} style={styles.scrollView}>
        <Text style={styles.label}>Tutor Name</Text>
        <TextInput style={styles.input} value={paidTo as string} editable={false} />

        <Text style={styles.label}>Your Name</Text>
        <TextInput style={styles.input} value={paidBy as string} editable={false} />

        <Text style={styles.label}>Leave Review</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={6}
          value={reviewText}
          onChangeText={setReviewText}
          placeholder="Type your feedback here..."
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
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
  headerContainer: {
    backgroundColor: "#FFAF2F",
    width: "100%",
    paddingVertical: 40,
    paddingHorizontal: 24, 
    justifyContent: "center",
    position: "relative",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8B402E",
    textAlign: "left", 
    marginTop: 10,
  },
  cancelButton: {
    position: "absolute",
    right: 24,
    top: 40,
    width: 35,      
    height: 35,
    zIndex: 1,
    padding: 5,
  },
  cancelIcon: {
    width: 28,
    height: 28,
    right: 24,
    top: 40,
  },
  container: {
    padding: 24,
    backgroundColor: "#fff",
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
    marginTop: 200, 
    alignItems: "center",
  },
  submitText: {
    color: "#8B402E",
    fontSize: 18,
    fontWeight: "bold",
  },
});
