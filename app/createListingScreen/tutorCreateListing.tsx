import CustomButton from "@/components/customButton";
import CustomDropDown from "@/components/customDropDown";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
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

export default function CreateListingTutor() {
  const [subjects, setSubjects] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [length, setLength] = useState(0);
  const [price, setPrice] = useState("");
  const [posting, setPosting] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [showStartTime, setShowStartTime] = useState(false);
  const [endTime, setEndTime] = useState(new Date());
  const [showEndTime, setShowEndTime] = useState(false);
  const [education, setEducation] = useState("");
  const [negotiable, setNegotiable] = useState("");
  const [day, setDay] = useState<string[]>([]);
  const [teachingLevel, setTeachingLevel] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [reviewCount, setReviewCount] = useState(0);
  const [totalRating, setTotalRating] = useState(0);

  const { userDoc } = useAuth();

  useEffect(() => { 
  const userRef = doc(db, "users", userDoc.userId);

  const unsubscribe = onSnapshot(userRef, async (docSnap) => { //store totalRatings and its count to later find the average rating
    if (docSnap.exists()) {
      const reviewIds = docSnap.data().reviewIds || [];
      setReviewCount(reviewIds.length);

      let sum = 0;
      for (const reviewId of reviewIds) {
        const reviewSnap = await getDoc(doc(db, "reviews", reviewId));
        if (reviewSnap.exists()) {
          const ratingStr = reviewSnap.data().ratings;
          const ratingNum = parseFloat(ratingStr); 
          if (!isNaN(ratingNum)) sum += ratingNum;
        }
      }
      setTotalRating(sum);
    }
  });
  return () => unsubscribe();
}, []);

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

  const levelOrder = [
    "primary",
    "secondary",
    "poly",
    "JC",
    "University/College",
  ];

  const listingRef = collection(db, "listings");

  const checkIfAllFieldsFilled = () => {
    return !!(
      subjects.trim() !== "" &&
      startTime instanceof Date &&
      endTime instanceof Date &&
      price.trim() !== "" &&
      negotiable.length > 0 &&
      day.length > 0 &&
      teachingLevel.length > 0
    );
  };

  const handlePost = async () => {
    if (!checkIfAllFieldsFilled()) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (parseFloat(price) < 3) {
      Alert.alert(
        "Minimum Pricing/hr is S$3",
        "Stripe will impose a S$2.70 tax, please raise your class cost accordingly."
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
    const formattedSubjects = subjectWords
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(", ");

    const sortedDays = day
      .slice()
      .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

    const sortedTeachingLevels = teachingLevel
      .slice()
      .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));

    try {
      await addDoc(listingRef, {
        name: userDoc?.name,
        userId: userDoc?.userId,
        role: userDoc?.role,
        subjects: formattedSubjects,
        price,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        date: sortedDays,
        teachingLevel: sortedTeachingLevels,
        negotiable,
        reviewCount: Number(reviewCount),
        totalRating: Number(totalRating),
        education: `${userDoc?.educationInstitute} ${userDoc?.educationLevel}`,
      });
        const q = query(collection(db, "listings"), where("userId", "==", userDoc?.userId)); 
        const querySnapshot = await getDocs(q); 
        const updatePromises = querySnapshot.docs.map(async (docSnap) => {
        const docRef = doc(db, "listings", docSnap.id);
        return updateDoc(docRef, { //update all reviewCount and totalRating of the user
        reviewCount: Number(reviewCount),
        totalRating: Number(totalRating),
        });
    });
        await Promise.all(updatePromises);
        console.log("All listings updated successfully.");
        Alert.alert("Success", "Your listing has been created successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to create listing. Please try again later.");
      console.error("Error creating or updating listing:", error);
    } finally {
      setPosting(false);
      router.push("/homeScreen/home");
    }
  };

  return (
    <View style={styles.page}>
      <View className="border-8 w-full items-center h-1/6 border-primaryBlue bg-primaryBlue">
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

        <Text style={styles.label}>Teaching Subjects</Text>
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
          <Text className="text-xs font-asap-medium text-darkBlue">
            Subject Count ({wordCount}/10)
          </Text>
          <Text className="text-xs font-asap-medium text-darkBlue">
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

        <Text style={styles.label}>Teaching Level</Text>
        <CustomDropDown
          options={["primary", "secondary", "poly", "JC", "University/College"]}
          selected={teachingLevel}
          multiple={true}
          onSelect={(values) => {
            if (Array.isArray(values)) {
              setTeachingLevel(values);
            }
          }}
        />

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
              role="tutor"
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
              role="tutor"
              onPress={() => setShowEndTime(false)}
            />
          </View>
        )}

        <Text style={styles.label}>Pricing per Hour</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your price per hour"
          placeholderTextColor="grey"
          value={price}
          onChangeText={(text) => setPrice(text)}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Negotiable Pricing</Text>
        <CustomDropDown
          options={["Yes", "No"]}
          selected={negotiable}
          multiple={false}
          onSelect={(value) => {
            if (typeof value === "string") {
              setNegotiable(value);
            }
          }}
        />
      </ScrollView>

      {errorMsg !== "" && (
        <Text style={{ color: "red", textAlign: "center", marginTop: 20 }}>
          {errorMsg}
        </Text>
      )}

      <TouchableOpacity
        style={styles.postButton}
        onPress={handlePost}
        disabled={posting}
      >
        <Text style={styles.postText}>{posting ? "Posting..." : "Post"}</Text>
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
    marginTop: 15,
  },
  container: {
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    marginTop: 12,
  },
  label: {
    fontSize: 16,
    fontFamily: "Asap-Regular",
    color: "#14317A",
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
  postButton: {
    backgroundColor: "#59AEFF",
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 35,
    marginVertical: 20,
    marginHorizontal: 24,
    alignItems: "center",
  },
  postText: {
    color: "#14317A",
    fontSize: 18,
    fontFamily: "Asap-Bold",
  },
});
