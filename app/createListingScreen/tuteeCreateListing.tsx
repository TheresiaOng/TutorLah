import CustomButton from "@/components/customButton";
import CustomDropDown from "@/components/customDropDown";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import React, { useEffect, useState } from "react";
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

export default function CreateListingTutee() {
  const [subjects, setSubjects] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [length, setLength] = useState(0);
  const [startPrice, setStartPrice] = useState("");
  const [endPrice, setEndPrice] = useState("");
  const [posting, setPosting] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [showStartTime, setShowStartTime] = useState(false);
  const [endTime, setEndTime] = useState(new Date());
  const [showEndTime, setShowEndTime] = useState(false);
  const [education, setEducation] = useState("");
  const [day, setDay] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const { userDoc } = useAuth();

  // Supabase client
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

  const secret = Constants.expoConfig?.extra?.supabaseApiKey;

  useEffect(() => {
    if (userDoc?.educationInstitute && userDoc?.educationLevel) {
      setEducation(`${userDoc.educationInstitute} ${userDoc.educationLevel}`);
    }
  }, [userDoc]);

  const MAX_SUBJECTS = 10;

  const handleSubject = (text: string) => {
    setLength(text.length);
    const words = text.split(",").map((word) => word.trim());
    const nonEmptyWords = words.filter((word) => word !== "");

    if (nonEmptyWords.length > MAX_SUBJECTS) return;

    const isValid = nonEmptyWords.every((word) => /^[a-zA-Z0-9]/.test(word));
    if (!isValid) {
      setErrorMsg("Each subject must start with a letter or number.");
      return;
    }

    setSubjects(text);
    setWordCount(nonEmptyWords.length);
    setErrorMsg("");
  };

  const dayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const listingRef = collection(db, "listings");

  const checkIfAllFieldsFilled = () => {
    return !!(
      subjects.trim() &&
      startPrice.trim() &&
      endPrice.trim() &&
      day.length > 0 &&
      startTime instanceof Date &&
      endTime instanceof Date
    );
  };

  const handlePost = async () => {
    if (!checkIfAllFieldsFilled()) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (parseFloat(endPrice) < parseFloat(startPrice)) {
      Alert.alert(
        "Price Error",
        "Starting price must be less than or equal to ending price"
      );
      return;
    }

    if (parseFloat(startPrice) < 3) {
      Alert.alert(
        "Minimum Pricing/hr is S$3",
        "Stripe will impose a S$2.70 tax, please raise your starting price accordingly."
      );
      return;
    }

    const rawSubjects = subjects.trim();
    const subjectWords = rawSubjects
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word.length > 0 && /[a-zA-Z]/.test(word));

    if (subjectWords.length === 0) {
      Alert.alert(
        "Invalid Subject",
        "Please enter at least one valid subject."
      );
      return;
    }

    setPosting(true);
    const formattedSubjects = subjectWords.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    const joinedSubjects = formattedSubjects.join(", ");

    for (const subject of formattedSubjects) {
      // try to embed each subject
      try {
        const res = await fetch(
          "https://ynikykgyystdyitckguc.supabase.co/functions/v1/embed-subjects",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${secret}`,
            },
            body: JSON.stringify({ subject }),
          }
        );

        if (!res.ok) {
          console.warn(`Failed for ${subject}`);
        }

        // retrieve row based on subject name
        const { data: existing, error: fetchError } = await supabase
          .from("subjects")
          .select("*")
          .eq("name", subject)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          // PGRST116 = no rows found (which is okay)
          throw fetchError;
        }

        // update subject count based on role
        const updatedCount = (existing["tuteecount"] ?? 0) + 1;

        const { error: updateError } = await supabase
          .from("subjects")
          .update({
            tuteecount: updatedCount,
            updatedat: new Date().toISOString(),
          })
          .eq("name", subject);

        if (updateError) throw updateError;
      } catch (error) {
        console.error(`Error calling function for ${subject}:`, error);
      }
    }

    const sortedDays = day
      .slice()
      .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

    try {
      await addDoc(listingRef, {
        name: userDoc?.name,
        userId: userDoc?.userId,
        role: userDoc?.role,
        subjects: joinedSubjects,
        startPrice,
        endPrice,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        date: sortedDays,
        photo_url: null,
        education: `${userDoc?.educationInstitute} ${userDoc?.educationLevel}`,
      });

      Alert.alert("Success", "Your listing has been created successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to create listing. Please try again later.");
      console.error("Error creating listing:", error);
    } finally {
      setPosting(false);
      router.push("/homeScreen/home");
    }
  };

  return (
    <View style={styles.page}>
      <View className="border-8 w-full items-center h-1/6 border-primaryOrange bg-primaryOrange">
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
          <Text style={styles.header}>Create Listing</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollView}
      >
        <Text style={styles.label}>Educational Level</Text>
        <TextInput
          style={styles.disabledInput}
          value={education}
          editable={false}
        />

        <Text style={styles.label}>Subjects Wanted</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#000"
          value={subjects}
          onChangeText={handleSubject}
          autoCapitalize="none"
          multiline
          maxLength={1000}
        />
        <View className="flex-row justify-between items-center px-4 mb-2">
          <Text className="text-xs font-asap-medium text-darkBrown">
            Subject Count ({wordCount}/10)
          </Text>
          <Text className="text-xs font-asap-medium text-darkBrown">
            Separate each subject with a comma (,)
          </Text>
        </View>

        {length === 1000 && (
          <View className="items-center justify-center w-full">
            <Text className="text-sm font-asap-regular mb-4 text-red-500">
              You have hit the limit of 1000 characters
            </Text>
          </View>
        )}

        <Text style={styles.label}>Available Days</Text>
        <CustomDropDown
          options={[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ]}
          selected={day}
          multiple={true}
          onSelect={(values) => {
            if (Array.isArray(values)) {
              setDay(values);
            }
          }}
        />

        <Text style={styles.label}>Start Time</Text>
        {!showStartTime ? (
          <TouchableOpacity
            onPress={() => {
              setShowStartTime(true);
              setShowEndTime(false);
            }}
          >
            <Text style={styles.input}>
              {startTime
                ? startTime.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : "Select Start Time"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-1">
            <DateTimePicker
              value={startTime}
              mode="time"
              textColor="black"
              display="spinner"
              onChange={(event, selectedTime) => {
                const currentTime = selectedTime || startTime;
                setStartTime(currentTime);
              }}
            />
            <CustomButton
              title="Confirm Start Time"
              role="tutee"
              onPress={() => setShowStartTime(false)}
            />
          </View>
        )}

        <Text style={styles.label}>End Time</Text>
        {!showEndTime ? (
          <TouchableOpacity
            onPress={() => {
              setShowStartTime(false);
              setShowEndTime(true);
            }}
          >
            <Text style={styles.input}>
              {endTime
                ? endTime.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : "Select End Time"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-1">
            <DateTimePicker
              value={endTime}
              mode="time"
              textColor="black"
              display="spinner"
              onChange={(event, selectedTime) => {
                const currentTime = selectedTime || endTime;
                setEndTime(currentTime);
              }}
            />
            <CustomButton
              title="Confirm End Time"
              role="tutee"
              onPress={() => setShowEndTime(false)}
            />
          </View>
        )}

        <Text style={styles.label}>Price Range per Hour</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            marginBottom: 24,
          }}
        >
          {/* Start Price Input */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 2,
              height: 56,
              borderColor: "#8e8e93",
              borderRadius: 24,
              paddingHorizontal: 15,
              width: "40%",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Asap-Regular",
                marginRight: 4,
              }}
            >
              S$
            </Text>
            <TextInput
              style={{ flex: 1, fontFamily: "Asap-Regular", fontSize: 16 }}
              placeholderTextColor="#8e8e93"
              placeholder="From"
              value={startPrice}
              onChangeText={(text) => {
                let cleaned = text.replace(/[^0-9.,]/g, "").replace(",", ".");
                const parts = cleaned.split(".");
                if (parts.length > 2 || parts[1]?.length > 2) return;
                setStartPrice(cleaned);
              }}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          {/* Dash */}
          <View
            style={{
              width: "10%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontFamily: "Asap-Bold",
                color: "#E9901B",
              }}
            >
              -
            </Text>
          </View>

          {/* End Price Input */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 2,
              height: 56,
              borderColor: "#8e8e93",
              borderRadius: 24,
              paddingHorizontal: 12,
              width: "40%",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Asap-Regular",
                marginRight: 4,
              }}
            >
              S$
            </Text>
            <TextInput
              style={{ flex: 1, fontFamily: "Asap-Regular", fontSize: 16 }}
              placeholderTextColor="#8e8e93"
              placeholder="To"
              value={endPrice}
              onChangeText={(text) => {
                let cleaned = text.replace(/[^0-9.,]/g, "").replace(",", ".");
                const parts = cleaned.split(".");
                if (parts.length > 2 || parts[1]?.length > 2) return;
                setEndPrice(cleaned);
              }}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>
      </ScrollView>

      {errorMsg !== "" && (
        <Text style={{ color: "red", textAlign: "center", marginTop: 20 }}>
          {errorMsg}
        </Text>
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handlePost}
        disabled={posting}
      >
        <Text style={styles.submitText}>{posting ? "Posting..." : "Post"}</Text>
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