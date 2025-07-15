import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import { router } from "expo-router";
import {
  doc,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditTuteeProfile() {
    const [name, setName] = useState("");
    const [educationLevel, setEducationLevel] = useState("");
    const [educationInstitute, setEducationInstitute] = useState("");
    const { userDoc } = useAuth();

    useEffect(() => {
  if (userDoc) {
    setName(userDoc.name || "");
    setEducationLevel(userDoc.educationLevel || "");
    setEducationInstitute(userDoc.educationInstitute || "");
  }
}, [userDoc]);

  const handleSubmit = async () => {
    if (!educationInstitute.trim() || !educationLevel.trim()) {
      alert("Please fill all fields before submitting.");
      return;
    }

    try {
      const userDocRef = await doc(db, "users", userDoc.userId); // Get user document reference
      await updateDoc(userDocRef, { // Update user document with new profile data
        educationLevel: educationLevel.trim(),
        educationInstitute: educationInstitute.trim(),
      });

      alert("Submitted successfully!");
      router.back();
    } catch (error) {
      console.error("Error submitting edits: ", error);
      alert("Failed to submit. Please try again.");
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
              source={require("../../assets/images/cancel.png")}
              className="w-10"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.header}>Edit Profile</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollView}
      > 
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          autoCapitalize="none"
          placeholder="Enter your name"
          placeholderTextColor="#5d5d5d"
        />

        <Text style={styles.label}>Educational Level</Text>
        <TextInput
          style={styles.input}
          value={educationLevel}
          onChangeText={setEducationLevel}
          autoCapitalize="none"
          placeholder="Enter your educational level"
          placeholderTextColor="#5d5d5d"
        />

        <Text style={styles.label}>Education Institute Name</Text>
        <TextInput
          style={styles.input}
          value={educationInstitute}
          onChangeText={setEducationInstitute}
          autoCapitalize="none"
          placeholder="Enter your education institute name"
          placeholderTextColor="#5d5d5d"
        />

      </ScrollView>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit</Text>
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
    color: "#8B402E", 
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#eee",
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
    fontFamily: "Asap-Regular",
    color: "#000",
    marginBottom: 20,
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
    fontFamily: "Asap-Bold",
  },
});