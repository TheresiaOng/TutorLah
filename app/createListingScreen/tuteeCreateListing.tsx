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
  ActivityIndicator,
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
  const [onePrice, setOnePrice] = useState(false);
  const [loadingPriceSuggestion, setLoadingPriceSuggestion] = useState(false);
  const [AIMessage, setAIMessage] = useState("");

  const { userDoc } = useAuth();

  // Supabase client
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

  const secret = Constants.expoConfig?.extra?.supabaseApiKey;

  useEffect(() => {
    if (userDoc?.educationInstitute && userDoc?.educationLevel) {
      setEducation(`${userDoc?.educationInstitute} ${userDoc?.educationLevel}`);
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

  useEffect(() => {
    setErrorMsg("");
    if (startTime && endTime) {
      const startMillis = startTime.getTime();
      const endMillis = endTime.getTime();

      const durationInHours = (endMillis - startMillis) / (1000 * 60 * 60);

      if (durationInHours == 0) {
        setErrorMsg("");
        return;
      }

      if (durationInHours <= 0.99 && durationInHours > 0) {
        setErrorMsg("Minimum time availability is 1 hour");
        return;
      } else if (durationInHours < 0) {
        setErrorMsg("End time must be later than start time");
        return;
      } else {
        setErrorMsg("");
      }
    } else {
      setErrorMsg("");
    }
  }, [startTime, endTime]);

  const handlePost = async () => {
    setPosting(true);

    const startMillis = startTime.getTime();
    const endMillis = endTime.getTime();

    const durationInHours = (endMillis - startMillis) / (1000 * 60 * 60);

    if (durationInHours === 0) {
      Alert.alert(
        "Timing Error",
        "Please adjust your time availability with a minimum of 1 hour window."
      );
      setPosting(false);
      return;
    }

    if (parseFloat(endPrice) < parseFloat(startPrice)) {
      Alert.alert(
        "Price Error",
        "Starting price must be less than or equal to ending price."
      );
      setPosting(false);
      return;
    }

    if (parseFloat(startPrice) < 3) {
      Alert.alert(
        "Minimum Pricing/hr is S$3",
        "Stripe will impose a S$2.70 tax, please raise your starting price accordingly."
      );
      setPosting(false);
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
      setPosting(false);
      return;
    }

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

        // Calculate the new average price from this listing
        const newAvgPrice = (parseFloat(startPrice) + parseFloat(endPrice)) / 2;

        const oldAvg = existing?.avgprice ?? 0;
        const oldCount = existing?.pricecount ?? 0;
        const oldMin = existing?.minprice ?? null;
        const oldMax = existing?.maxprice ?? null;

        const updatedPriceCount = oldCount + 1;
        const updatedAvgPrice =
          (oldAvg * oldCount + newAvgPrice) / updatedPriceCount;

        const updatedMinPrice =
          oldMin !== null ? Math.min(oldMin, newAvgPrice) : newAvgPrice;
        const updatedMaxPrice =
          oldMax !== null ? Math.max(oldMax, newAvgPrice) : newAvgPrice;

        const { error: updateError } = await supabase
          .from("subjects")
          .update({
            tuteecount: updatedCount,
            avgprice: Math.round(updatedAvgPrice * 100) / 100,
            pricecount: updatedPriceCount,
            minprice: updatedMinPrice,
            maxprice: updatedMaxPrice,
            updatedat: new Date().toISOString(),
          })
          .eq("name", subject);

        if (updateError) throw updateError;
      } catch (error) {
        console.error(`Error calling function for ${subject}:`, error);
        Alert.alert(
          "Error",
          "An unexpected error occured. Please try again later."
        );
        setPosting(false);
      }
    }

    const sortedDays = day
      .slice()
      .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

    const formatTime = (date: Date) => {
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`; // format like "08:30"
    };

    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);

    try {
      await addDoc(listingRef, {
        name: userDoc?.name,
        userId: userDoc?.userId,
        role: userDoc?.role,
        subjects: joinedSubjects,
        startPrice,
        endPrice,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
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

  const handlePriceSuggestion = async () => {
    if (subjects.trim() == "") {
      Alert.alert(
        "Fields Missing",
        "Please fill Subjects Wanted before asking for price suggestion."
      );
      return;
    }

    setLoadingPriceSuggestion(true);

    const rawSubjects = subjects.trim();
    const subjectWords = rawSubjects
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word.length > 0 && /[a-zA-Z]/.test(word));
    const formattedSubjects = subjectWords.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );

    try {
      const res = await fetch(
        "https://ynikykgyystdyitckguc.supabase.co/functions/v1/price-suggestion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${secret}`,
          },
          body: JSON.stringify({
            subjects: formattedSubjects,
            educationalLevel: education,
            role: userDoc?.role,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        const message =
          errorData.error || "Something went wrong while getting suggestions.";
        Alert.alert("Suggestion Error", message);
        setLoadingPriceSuggestion(false);
        return;
      }

      const { cohereMessage } = await res.json();
      console.log("AI Price Suggestion:", cohereMessage);
      setAIMessage(cohereMessage);
    } catch (error) {
      console.error("Error calling price suggestion:", error);
      Alert.alert("Error", "Unable to fetch AI suggestion. Try again later.");
    } finally {
      setLoadingPriceSuggestion(false);
    }
  };

  return (
    <View style={styles.page}>
      <View className="border-8 w-full items-center h-36 border-primaryOrange bg-primaryOrange">
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
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

          <Text style={styles.label}>Days Available</Text>
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

          <View className="flex-row justify-between">
            <Text style={styles.label}>
              {onePrice ? "Price per Hour" : "Price Range per Hour"}
            </Text>
            <View className="w-fit mt-2.5 mb-4">
              <CustomButton
                title="Change Price Setup"
                onPress={() => setOnePrice(!onePrice)}
                role="tutee"
                extraClassName="h-7 px-4"
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 10,
            }}
          >
            <TouchableOpacity
              className="mb-3 rounded-3xl p-2 border-2 border-primaryOrange"
              onPress={handlePriceSuggestion}
            >
              {loadingPriceSuggestion ? (
                <ActivityIndicator size="large" />
              ) : (
                <Image
                  source={require("@/assets/images/orangeSparkle.png")}
                  className="w-10 h-10"
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
            {onePrice ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 2,
                  height: 56,
                  borderColor: "#8e8e93",
                  borderRadius: 24,
                  paddingHorizontal: 15,
                  width: "83%",
                  marginBottom: 12,
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
                  style={{
                    flex: 1,
                    fontFamily: "Asap-Regular",
                    fontSize: 16,
                  }}
                  placeholderTextColor="#8e8e93"
                  placeholder="Price"
                  value={startPrice}
                  onChangeText={(text) => {
                    // Replace comma with dot
                    let cleaned = text.replace(",", ".");

                    // Allow only numbers and one dot
                    cleaned = cleaned.replace(/[^0-9.]/g, "");

                    // Prevent multiple dots
                    const parts = cleaned.split(".");
                    if (parts.length > 2) return;

                    const [intPart, decPart] = parts;

                    // Limit integer part to 5 digits (e.g., 99999)
                    if (intPart.length > 5) return;

                    // Limit to 2 digits after decimal
                    if (decPart?.length > 2) return;

                    setStartPrice(cleaned);
                    setEndPrice(cleaned);
                  }}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            ) : (
              <>
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
                    width: "35%",
                    marginBottom: 12,
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
                    style={{
                      flex: 1,
                      fontFamily: "Asap-Regular",
                      fontSize: 16,
                    }}
                    placeholderTextColor="#8e8e93"
                    placeholder="From"
                    value={startPrice}
                    onChangeText={(text) => {
                      // Replace comma with dot
                      let cleaned = text.replace(",", ".");

                      // Allow only numbers and one dot
                      cleaned = cleaned.replace(/[^0-9.]/g, "");

                      // Prevent multiple dots
                      const parts = cleaned.split(".");
                      if (parts.length > 2) return;

                      const [intPart, decPart] = parts;

                      // Limit integer part to 5 digits (e.g., 99999)
                      if (intPart.length > 5) return;

                      // Limit to 2 digits after decimal
                      if (decPart?.length > 2) return;

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
                    marginBottom: 12,
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
                    paddingHorizontal: 15,
                    width: "35%",
                    marginBottom: 12,
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
                    style={{
                      flex: 1,
                      fontFamily: "Asap-Regular",
                      fontSize: 16,
                    }}
                    placeholderTextColor="#8e8e93"
                    placeholder="To"
                    value={endPrice}
                    onChangeText={(text) => {
                      // Replace comma with dot
                      let cleaned = text.replace(",", ".");

                      // Allow only numbers and one dot
                      cleaned = cleaned.replace(/[^0-9.]/g, "");

                      // Prevent multiple dots
                      const parts = cleaned.split(".");
                      if (parts.length > 2) return;

                      const [intPart, decPart] = parts;

                      // Limit integer part to 5 digits (e.g., 99999)
                      if (intPart.length > 5) return;

                      // Limit to 2 digits after decimal
                      if (decPart?.length > 2) return;

                      setEndPrice(cleaned);
                    }}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
              </>
            )}
          </View>
          {AIMessage && (
            <View className="bg-white p-4 rounded-2xl shadow-sm mb-4">
              {/* Explanation + Breakdown */}
              {AIMessage.split("\n")
                .filter((line) => line.trim().length > 0)
                .map((line, idx) => {
                  const isHeading = line.startsWith("##");
                  const isBullet = line.trim().startsWith("- ");

                  return (
                    <Text
                      key={idx}
                      className={
                        isHeading
                          ? "font-asap-semibold text-lg text-darkPrimaryOrange mt-4 mb-1"
                          : isBullet
                          ? "font-asap-regular ml-2 text-base text-gray-700"
                          : " font-asap-regular text-base text-gray-800"
                      }
                    >
                      {line.replace(/^##\s?/, "")}
                    </Text>
                  );
                })}
              <TouchableOpacity
                onPress={() => setAIMessage("")}
                className="absolute -top-4 -right-4 z-10"
              >
                <Image
                  source={require("@/assets/images/cancel.png")}
                  className="bg-red-500 rounded-full p-1 w-8 h-8"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {errorMsg !== "" && (
        <Text style={{ color: "red", textAlign: "center", marginTop: 20 }}>
          {errorMsg}
        </Text>
      )}

      <View className="mb-12 mx-6 mt-4">
        <CustomButton
          title="Post"
          onPress={handlePost}
          loading={posting}
          active={errorMsg == "" && !posting && checkIfAllFieldsFilled()}
          role="tutee"
        />
      </View>
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
