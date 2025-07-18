import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import { createClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
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

export default function EditTutorProfile() {
    const [name, setName] = useState("");
    const [educationLevel, setEducationLevel] = useState("");
    const [educationInstitute, setEducationInstitute] = useState("");
    const [achievements, setAchievements] = useState("");
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const { userDoc } = useAuth();

    const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
    const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

    const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission required to access media library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const fileName = `${userDoc.userId}_${Date.now()}.jpg`;

      if (!file.base64) {
        alert("Image encoding failed. Try again.");
        return;
      }
      const fileBuffer = decode(file.base64);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, fileBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload failed:", uploadError);
        alert("Failed to upload image.");
        return;
      }

      // Get the public URL
      const { data } = supabase.storage.from("profile-pictures").getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      // Save to Supabase `profiles` table
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({ id: userDoc.userId, photo_url: publicUrl });

      if (upsertError) {
        console.error("Error saving URL to database:", upsertError);
        alert("Upload succeeded but failed to save profile picture.");
        return;
      }

      setPhotoUrl(publicUrl);
      alert("Profile picture uploaded successfully!");
    }
  };

    const handleRemoveImage = async () => {
      if (!userDoc?.userId) {
        alert("User not found.");
        return;
      }
      try {
        const { error: deleteError } = await supabase // Delete profile picture from Supabase 'profiles' table
          .from("profiles")
          .delete()
          .eq("id", userDoc.userId);

        if (deleteError) {
          alert("No previous profile picture uploaded so no profile picture to remove!");
          return;
        }

        setPhotoUrl(null);
        alert("Profile picture removed successfully!");
      } catch (error) {
        console.error("Unexpected error removing profile picture:", error);
        alert("Something went wrong. Please try again.");
      }
    };


    useEffect(() => {
      if (userDoc) {
        setName(userDoc.name || "");
        setAchievements(userDoc.achievements || "");
        setEducationLevel(userDoc.educationLevel || "");
        setEducationInstitute(userDoc.educationInstitute || "");
      }
    }, [userDoc]);

  const handleSubmit = async () => {
    if (!educationInstitute.trim() || !educationLevel.trim() || !name.trim()) {
      alert("Please fill all necessary fields before submitting.");
      return;
    }

    try {
      const userDocRef = await doc(db, "users", userDoc.userId); // Get user document reference
      await updateDoc(userDocRef, { // Update user document with new profile data
        name: name.trim(),
        educationLevel: educationLevel.trim(),
        educationInstitute: educationInstitute.trim(),
        achievements: achievements.trim(),
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
      <View className="border-8 w-full items-center h-1/6 border-primaryBlue bg-primaryBlue">
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

        <Text style={styles.label}>Achievements</Text>
        <TextInput
          style={styles.input}
          value={achievements}
          onChangeText={setAchievements}
          autoCapitalize="none"
          placeholder="Leave blank if unsure"
          placeholderTextColor="#5d5d5d"
        />

        <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
          <Text style={styles.uploadButtonText}>Upload Profile Picture</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.removeButton} onPress={handleRemoveImage}>
          <Text style={styles.removeButtonText}>Remove Profile Picture</Text>
        </TouchableOpacity>

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
    color: "white", 
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
    color: "#1A4F82", 
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
  uploadButton: {
    backgroundColor: "#59AEFF", 
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
    alignSelf: "center",
  },
  uploadButtonText: {
    color: "#14317A",  
    fontSize: 16,
    fontFamily: "Asap-Bold",
  },
  removeButton: {
    backgroundColor: "#59AEFF", 
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
    alignSelf: "center",
  },
  removeButtonText: {
    color: "#14317A",  
    fontSize: 16,
    fontFamily: "Asap-Bold",
  },
  submitButton: {
    backgroundColor: "#59AEFF", 
    borderRadius: 12,
    paddingVertical: 12,
    marginVertical: 20,
    marginHorizontal: 24,
    alignItems: "center",
  },
  submitText: {
    color: "#14317A", 
    fontSize: 18,
    fontFamily: "Asap-Bold",
  },
});