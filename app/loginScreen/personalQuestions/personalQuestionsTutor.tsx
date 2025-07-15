import CustomButton from "@/components/customButton";
import CustomDropDown from "@/components/customDropDown";
import CustomSearchDropDown from "@/components/customSearchDropDown";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { router } from "expo-router";
import { collection, doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PersonalQuestions = () => {
  const { userDoc } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [yearOfTeaching, setYearOfTeaching] = useState<string>("");
  const [teachingLevel, setTeachingLevel] = useState<string[]>([]);
  const [subjectsToTeach, setSubjectsToTeach] = useState<string[]>([]);
  const [sourcePool, setSourcePool] = useState<string[]>([]);

  // Supabase client
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

  const secret = Constants.expoConfig?.extra?.supabaseApiKey;

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase.from("subjects").select("name");

      if (error) {
        console.error("Error fetching subjects:", error);
      }

      const names = (data ?? [])
        .map((item) => item.name)
        .filter((name): name is string => typeof name === "string");

      setSourcePool(names);
      console.log("Subject pool updated:", names);
    };

    fetchSubjects();
  }, []);

  const isAllFieldsFilled =
    yearOfTeaching.trim() !== "" &&
    teachingLevel.length > 0 &&
    subjectsToTeach.length > 0;

  const levelOrder = [
    "Primary",
    "Secondary",
    "Poly",
    "JC",
    "IB",
    "University/College",
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    const usersRef = collection(db, "users");
    const docRef = doc(usersRef, userDoc?.userId);

    for (const subject of subjectsToTeach) {
      try {
        const res = await fetch(
          "https://ynikykgyystdyitckguc.supabase.co/functions/v1/embed-subjects",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${secret}`,
            },
            body: JSON.stringify({ subject, role: userDoc?.role }),
          }
        );

        if (!res.ok) {
          console.warn(`Failed for ${subject}`);
        }
      } catch (error) {
        console.error(`Error calling function for ${subject}:`, error);
      }
    }

    // retrieve embedding data for each subject
    const { data: subjectEmbeddings, error } = await supabase
      .from("subjects")
      .select("embedding")
      .in("name", subjectsToTeach.sort());

    console.log("Embedding for each subjects retrieved");

    function averageVectors(vectors: number[][]): number[] {
      if (vectors.length === 0) {
        throw new Error("No vectors provided to averageVectors");
      }

      const length = vectors[0].length;

      for (const vec of vectors) {
        // check to make sure all vectors are of equal length
        if (vec.length !== length) {
          throw new Error("Inconsistent vector lengths");
        }
      }

      const summed = vectors.reduce((acc, vec) =>
        acc.map((val, i) => val + vec[i])
      );
      return summed.map((val) => val / vectors.length); // return one combined vector
    }

    if (!subjectEmbeddings || subjectEmbeddings.length === 0) {
      console.error("No embeddings found for selected subjects");
      return;
    }

    console.log("Embedding for each subjects exists");

    const rawEmbeddings = subjectEmbeddings
      // raw embeddings is a 2D array of numbers
      ?.map((e) =>
        typeof e.embedding === "string" ? JSON.parse(e.embedding) : e.embedding
      )
      .filter((e): e is number[] => Array.isArray(e));

    console.log("Raw Embeddings:", JSON.stringify(rawEmbeddings));

    let userEmbedding: number[];

    try {
      userEmbedding = averageVectors(rawEmbeddings as number[][]);
      console.log("Averaging successful");
    } catch (e) {
      console.error("Error during averaging:", e);
      Alert.alert("Averaging failed", "Check subject embedding shapes");
      setSubmitting(false);
      return;
    }
    console.log("Averaging subjects embeddings");

    const roundedEmbedding = userEmbedding.map(
      (x) => Math.round(x * 1e6) / 1e6
      // reduce vector length to accomodate firestore document size limit
    );
    console.log("Rounding average vector successful");

    const sortedTeachingLevel = teachingLevel
      .slice()
      .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));

    try {
      await updateDoc(docRef, {
        yearOfTeaching: yearOfTeaching,
        teachingLevel: sortedTeachingLevel,
        subjectsToTeach: subjectsToTeach.sort(),
        embeddedSubjectToTeach: roundedEmbedding,
        personalised: true,
      });
      console.log("Personalisation sucessful!");
      Alert.alert("Success", "We will start personalising your feed!");
      setSubmitting(false);
      router.replace("/homeScreen/home");
    } catch (error) {
      console.log("Error personalising user document:", error);
      Alert.alert("Error", "An error occured, please try again later.");
      setSubmitting(false);
      router.back();
    }
  };

  return (
    <View className={`flex-1 bg-primaryBlue`}>
      {/* Header */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-16 w-10 h-10 left-5 items-center justify-center"
        disabled={submitting}
      >
        <Image
          className="w-10"
          resizeMode="contain"
          source={require("../../../assets/images/arrowBack.png")}
        />
      </TouchableOpacity>
      <View className="items-center">
        <Text className={`mt-4 mb-10 text-3xl font-asap-bold text-white`}>
          You are almost done!
        </Text>
      </View>
      <View className="flex-1 bg-white rounded-t-3xl pt-12 px-6">
        {/* Scrollable Form and Question Fields */}
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="items-center">
            <Text
              style={{ textAlign: "center", lineHeight: 18 }}
              className={`text-xl font-asap-medium text-darkPrimaryBlue mb-8`}
            >
              {`These information will help us personalize \nyour feed and won't be shown to others`}
            </Text>
          </View>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 200 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Questions */}
            <View className="w-full mt-2">
              <Text
                className={`text-sm pl-4 font-asap-medium text-darkPrimaryBlue`}
              >
                How long have you became a tutor?
              </Text>
              <CustomDropDown
                options={[
                  "Never",
                  "< 1 Year",
                  "1 - 2 Years",
                  "3 - 5 Years",
                  "> 5 Years",
                ]}
                selected={yearOfTeaching}
                onSelect={(values) => {
                  if (typeof values === "string") {
                    setYearOfTeaching(values);
                  }
                }}
              />
              <Text
                className={`text-sm pl-4 pt-8 font-asap-medium text-darkPrimaryBlue`}
              >
                Which grade/level are you planning to teach?
              </Text>
              <CustomDropDown
                options={[
                  "Primary",
                  "Secondary",
                  "Poly",
                  "JC",
                  "IB",
                  "University/College",
                ]}
                selected={teachingLevel}
                multiple={true}
                onSelect={(values) => {
                  if (Array.isArray(values)) {
                    setTeachingLevel(values);
                  }
                }}
              />
              <Text
                className={`text-sm pl-4 pt-8 mb-3 font-asap-medium text-darkPrimaryBlue`}
              >
                What subjects are you planning to teach?
              </Text>
              <CustomSearchDropDown
                source={sourcePool}
                placeHolder="E.g. Math, Biology, CS2040S"
                onChange={setSubjectsToTeach}
                selected={subjectsToTeach}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Bottom Section */}
        <View className="mb-12 mt-8">
          <CustomButton
            title="Submit"
            role={userDoc?.role as "tutor" | "tutee"}
            onPress={handleSubmit}
            active={isAllFieldsFilled}
            loading={submitting}
          />
        </View>
      </View>
    </View>
  );
};

export default PersonalQuestions;

const styles = StyleSheet.create({});
