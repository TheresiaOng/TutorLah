import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import { createClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
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
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const { userDoc } = useAuth();

  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

  const updateFirestoreUrl = async (newPhotoUrl: string | null) => {
    //update profile picture url
    try {
      if (!userDoc?.userId) throw new Error("Missing user ID");

      const userRef = doc(db, "users", userDoc.userId); // assuming doc ID = userId
      await updateDoc(userRef, {
        photoUrl: newPhotoUrl,
      });

      console.log("User profile updated with new photo_url");
    } catch (error) {
      console.log("Error updating user profile photo_url:", error);
    }
  };

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
      const { data } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(fileName);
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
      await updateFirestoreUrl(publicUrl);
      Alert.alert("Success", "Profile picture uploaded successfully!");
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
        alert(
          "No previous profile picture uploaded so no profile picture to remove!"
        );
        return;
      }
      setPhotoUrl(null);
      await updateFirestoreUrl(null);
      alert("Profile picture removed successfully!");
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
  };

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
        await updateFirestoreUrl(data?.photo_url || null);
      }
    };
    fetchData();
  }, [userDoc]);

  useEffect(() => {
    if (userDoc) {
      setName(userDoc.name || "");
      setEducationLevel(userDoc.educationLevel || "");
      setEducationInstitute(userDoc.educationInstitute || "");
    }
  }, [userDoc]);

  const handleSubmit = async () => {
    if (!educationInstitute.trim() || !educationLevel.trim() || !name.trim()) {
      alert("Please fill all fields before submitting.");
      return;
    }

    try {
      const userDocRef = await doc(db, "users", userDoc.userId); // Get user document reference
      await updateDoc(userDocRef, {
        // Update user document with new profile data
        name: name.trim(),
        educationLevel: educationLevel.trim(),
        educationInstitute: educationInstitute.trim(),
      });

      Alert.alert("Success", "Changes applied successfully!");
      router.replace({
        pathname: "/profileScreen/tuteeProfile",
        params: userDoc?.userId,
      });
    } catch (error) {
      console.error("Error submitting edits: ", error);
      Alert.alert("Error", "Failed to apply changes. Please try again.");
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
            onPress={() => {
              Alert.alert(
                "Discard Changes",
                "This action will discard any changes made except for pictures.",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Discard",
                    onPress: () =>
                      router.replace({
                        pathname: "/profileScreen/tuteeProfile",
                        params: userDoc?.userId,
                      }),
                    style: "destructive",
                  },
                ]
              );
            }}
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          style={styles.scrollView}
        >
          <View style={styles.photoContainer}>
            <Image
              source={
                photoUrl
                  ? { uri: photoUrl }
                  : require("../../assets/images/hatLogo.png")
              }
              style={styles.profilePhoto}
              className={`${!photoUrl && "pt-4"}`}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePickImage}
            >
              <Text style={styles.uploadButtonText}>Upload Picture</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={!photoUrl ? styles.disabledButton : styles.removeButton}
              onPress={handleRemoveImage}
              disabled={!photoUrl}
            >
              <Text
                style={
                  !photoUrl ? styles.disabledText : styles.removeButtonText
                }
              >
                Remove Picture
              </Text>
            </TouchableOpacity>
          </View>

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
      </KeyboardAvoidingView>
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
  photoContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFAF2F",
    backgroundColor: "white",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: "#FFD256",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  removeButton: {
    flex: 1,
    backgroundColor: "#FFD256",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#8B402E",
    fontSize: 16,
    fontFamily: "Asap-Bold",
  },
  removeButtonText: {
    color: "#8B402E",
    fontSize: 16,
    fontFamily: "Asap-Bold",
  },
  disabledButton: {
    flex: 1,
    backgroundColor: "#ebebeb",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledText: {
    color: "#5d5d5d",
    fontSize: 16,
    fontFamily: "Asap-Bold",
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
