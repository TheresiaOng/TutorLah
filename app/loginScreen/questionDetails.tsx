import { useAuth } from "@/contexts/authContext";
import { auth, db } from "@/firebase";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Button, ScrollView, Text, TextInput, View } from "react-native";
import errorhandling from "./errorhandling";

type QuestionDetailsProps = {
  role: "tutor" | "tutee";
  email: string;
  password: string;
  onError?: (error: string) => void;
};

const QuestionDetails = ({
  email,
  password,
  role,
  onError,
}: QuestionDetailsProps) => {
  const [name, setName] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [educationInstitute, setEducationInstitute] = useState("");
  const [achievements, setAchievements] = useState("");
  const [teachableSubjects, setTeachableSubjects] = useState("");
  const [subjectsToLearn, setSubjectsToLearn] = useState("");

  const usersRef = collection(db, "users");
  const rolesRef = collection(
    usersRef,
    role === "tutor" ? "roles/tutors" : "roles/tutees"
  );

  const { setUserDocID, setUserRole } = useAuth();

  // Reset fields when the role changes
  // This effect runs when the component mounts and whenever the role changes
  useEffect(() => {
    setEducationLevel("");
    setEducationInstitute("");
    setAchievements("");
    setTeachableSubjects("");
    setSubjectsToLearn("");
    setName("");
  }, [role]);

  const nextPage = () => {
    router.push("/homeScreen/home");
  };

  const handleNext = async () => {
    // Handle the next action based on the role and input values
    if (role === "tutor") {
      if (
        !educationLevel ||
        !achievements ||
        !educationInstitute ||
        !teachableSubjects ||
        !name
      ) {
        onError?.("Please fill all fields for tutor.");
      } else {
        if (email && password) {
          try {
            // Create a new user with email and password
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );

            const docRef = doc(rolesRef, userCredential.user.uid);

            // Add the user details to the Firestore collection
            await setDoc(docRef, {
              email: email,
              name: name,
              educationLevel: educationLevel,
              educationInstitute: educationInstitute,
              achievements: achievements,
              teachableSubjects: teachableSubjects,
            });
            // Set the user document ID and role in the auth context
            setUserDocID(docRef.id);
            setUserRole(role);
            console.log(userCredential.user);
            // Call the nextPage function to navigate to the next screen
            nextPage();
          } catch (error: any) {
            const errorMessage = errorhandling(error);
            onError?.(errorMessage ?? "");
          }
        } else {
          onError?.("Please enter email and password.");
        }
      }
    } else {
      if (!educationLevel || !educationInstitute || !subjectsToLearn || !name) {
        onError?.("Please fill all fields for tutee.");
      } else {
        if (email && password) {
          try {
            // Create a new user with email and password
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );

            const docRef = doc(rolesRef, userCredential.user.uid);
            // Add the user details to the Firestore collection
            await setDoc(docRef, {
              email: email,
              name: name,
              educationLevel: educationLevel,
              educationInstitute: educationInstitute,
              subjectsToLearn: subjectsToLearn,
            });

            // Set the user document ID in the auth context
            setUserDocID(docRef.id);
            setUserRole(role);
            console.log(userCredential.user);
            // Call the nextPage function to navigate to the next screen
            nextPage();
          } catch (error: any) {
            const errorMessage = errorhandling(error);
            onError?.(errorMessage ?? "");
          }
        } else {
          onError?.("Please enter email and password.");
        }
      }
    }
  };

  return (
    <ScrollView className="bg-white px-6 pt-8">
      {role === "tutor" ? (
        <View className="space-y-4">
          <Text className="text-base pl-4 font-medium text-darkPrimary">
            Name
          </Text>
          <TextInput
            className="border-2 rounded-full border-gray p-2 mb-4 w-96"
            autoCapitalize="none"
            value={name}
            onChangeText={setName}
          />
          <Text className="text-base pl-4 font-medium text-darkPrimary">
            Educational Level
          </Text>
          <TextInput
            className="border-2 rounded-full border-gray p-2 mb-4 w-96"
            autoCapitalize="none"
            value={educationLevel}
            onChangeText={setEducationLevel}
          />
          <Text className="text-base pl-4 font-medium text-darkPrimary">
            Education Institute Name
          </Text>
          <TextInput
            className="border-2 rounded-full border-gray p-2 mb-4 w-96"
            autoCapitalize="none"
            value={educationInstitute}
            onChangeText={setEducationInstitute}
          />
          <Text className="text-base pl-4 font-medium text-darkPrimary">
            Achievements
          </Text>
          <TextInput
            className="border-2 rounded-full border-gray p-2 mb-4 w-96"
            autoCapitalize="none"
            value={achievements}
            onChangeText={setAchievements}
          />
          <Text className="text-base pl-4 font-medium text-darkPrimary">
            Teachable Subjects
          </Text>
          <TextInput
            className="border-2 rounded-full border-gray p-2 mb-4 w-96"
            autoCapitalize="none"
            value={teachableSubjects}
            onChangeText={setTeachableSubjects}
          />
        </View>
      ) : (
        <View className="space-y-4">
          <Text className="text-base pl-4 font-medium text-darkPrimary">
            Name
          </Text>
          <TextInput
            className="border-2 rounded-full border-gray p-2 mb-4 w-96"
            autoCapitalize="none"
            value={name}
            onChangeText={setName}
          />
          <Text className="text-base pl-4 font-medium text-darkPrimary">
            Educational Level
          </Text>
          <TextInput
            className="border-2 rounded-full border-gray p-2 mb-4 w-96"
            autoCapitalize="none"
            value={educationLevel}
            onChangeText={setEducationLevel}
          />
          <Text className="text-base pl-4 font-medium text-darkPrimary">
            Education Institute Name
          </Text>
          <TextInput
            className="border-2 rounded-full border-gray p-2 mb-4 w-96"
            autoCapitalize="none"
            value={educationInstitute}
            onChangeText={setEducationInstitute}
          />
          <Text className="text-base pl-4 font-medium text-darkPrimary">
            Subjects to Learn
          </Text>
          <TextInput
            className="border-2 rounded-full border-gray p-2 mb-4 w-96"
            autoCapitalize="none"
            value={subjectsToLearn}
            onChangeText={setSubjectsToLearn}
          />
        </View>
      )}
      <Button title="Sign Up" onPress={() => handleNext()}></Button>
    </ScrollView>
  );
};

export default QuestionDetails;
