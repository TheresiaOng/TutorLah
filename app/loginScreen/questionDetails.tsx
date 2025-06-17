import { auth, db } from "@/firebase";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Text, TextInput, View } from "react-native";
import errorhandling from "./errorhandling";

type QuestionDetailsProps = {
  role: "tutor" | "tutee";
  email: string;
  password: string;
  onError?: (error: string) => void;
  next: () => void;
};

export type QuestionDetailsRef = {
  submit: () => void;
};

const QuestionDetails = forwardRef<QuestionDetailsRef, QuestionDetailsProps>(
  ({ role, email, password, onError, next }, ref) => {
    const [name, setName] = useState("");
    const [educationLevel, setEducationLevel] = useState("");
    const [educationInstitute, setEducationInstitute] = useState("");
    const [achievements, setAchievements] = useState("");

    const usersRef = collection(db, "users");

    // Reset fields when the role changes
    // This effect runs when the component mounts and whenever the role changes
    useEffect(() => {
      setAchievements("");
    }, [role]);

    const handleNext = async () => {
      if (role === "tutor") {
        if (!educationLevel || !educationInstitute || !name) {
          onError?.("Please fill all fields for tutor.");
        } else if (email && password) {
          try {
            // Creating user for firebase auth
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );

            // Storing user data in firestore
            const docRef = doc(usersRef, userCredential.user.uid);
            await setDoc(docRef, {
              userId: userCredential.user.uid,
              role,
              email,
              name,
              educationLevel,
              educationInstitute,
              achievements,
            });

            // Creating user for Stream
            const streamUser = await fetch(
              "https://ynikykgyystdyitckguc.supabase.co/functions/v1/create-stream-user",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluaWt5a2d5eXN0ZHlpdGNrZ3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDY2MjQsImV4cCI6MjA2NTU4MjYyNH0._fFlVovJ6dO7XdPXG9BwAgCyONTJEJakRnWefN51L7c`,
                },
                body: JSON.stringify({
                  id: userCredential.user.uid,
                  name,
                  role,
                }),
              }
            );

            const result = await streamUser.json();
            console.log("Stream user created:", result);

            router.push("/homeScreen/home");
          } catch (error: any) {
            const errorMessage = errorhandling(error);
            onError?.(errorMessage ?? "");
          }
        } else {
          onError?.("Please enter email and password.");
        }
      } else {
        if (!educationLevel || !educationInstitute || !name) {
          onError?.("Please fill all fields for tutee.");
        } else if (email && password) {
          try {
            // Creating user for firebase auth
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );

            // Storing user data in firestore
            const docRef = doc(usersRef, userCredential.user.uid);
            await setDoc(docRef, {
              userId: userCredential.user.uid,
              role,
              email,
              name,
              educationLevel,
              educationInstitute,
            });

            // Creating user for Stream
            const streamUser = await fetch(
              "https://ynikykgyystdyitckguc.supabase.co/functions/v1/create-stream-user",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluaWt5a2d5eXN0ZHlpdGNrZ3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDY2MjQsImV4cCI6MjA2NTU4MjYyNH0._fFlVovJ6dO7XdPXG9BwAgCyONTJEJakRnWefN51L7c`,
                },
                body: JSON.stringify({
                  id: userCredential.user.uid,
                  name,
                  role,
                }),
              }
            );

            const result = await streamUser.json();
            console.log("Stream user created:", result);

            router.push("/homeScreen/home");
          } catch (error: any) {
            const errorMessage = errorhandling(error);
            onError?.(errorMessage ?? "");
          }
        } else {
          onError?.("Please enter email and password.");
        }
      }
    };

    useImperativeHandle(ref, () => ({
      submit: handleNext,
    }));

    return (
      <View className="items-center">
        {role === "tutor" ? (
          <View className="space-y-4 w-full">
            <Text className="text-sm pl-4 font-asap-medium text-darkPrimaryBlue">
              Name
            </Text>
            <TextInput
              className="border-2 font-asap-regular rounded-full border-gray p-2 mb-4"
              autoCapitalize="none"
              value={name}
              onChangeText={setName}
            />
            <Text className="text-sm  pl-4 font-asap-medium text-darkPrimaryBlue">
              Education Institute Name
            </Text>
            <TextInput
              className="border-2 font-asap-regular rounded-full border-gray p-2 mb-4"
              autoCapitalize="none"
              value={educationInstitute}
              onChangeText={setEducationInstitute}
            />
            <Text className="text-sm  pl-4 font-asap-medium text-darkPrimaryBlue">
              Educational Level
            </Text>
            <TextInput
              className="border-2 font-asap-regular rounded-full border-gray p-2 mb-4"
              autoCapitalize="none"
              value={educationLevel}
              onChangeText={setEducationLevel}
            />
            <Text className="text-sm  pl-4 font-asap-medium text-darkPrimaryBlue">
              Achievements
            </Text>
            <TextInput
              className="border-2 font-asap-regular rounded-full border-gray p-2 mb-4"
              autoCapitalize="none"
              value={achievements}
              onChangeText={setAchievements}
              placeholder="Leave blank if unsure"
              placeholderTextColor={"#8e8e93"}
            />
          </View>
        ) : (
          <View className="space-y-4 w-full">
            <Text className="text-sm  pl-4 font-asap-medium text-darkPrimaryOrange">
              Name
            </Text>
            <TextInput
              className="border-2 font-asap-regular rounded-full border-gray p-2 mb-4"
              autoCapitalize="none"
              value={name}
              onChangeText={setName}
            />
            <Text className="text-sm  pl-4 font-asap-medium text-darkPrimaryOrange">
              Education Institute Name
            </Text>
            <TextInput
              className="border-2 font-asap-regular rounded-full border-gray p-2 mb-4"
              autoCapitalize="none"
              value={educationInstitute}
              onChangeText={setEducationInstitute}
            />
            <Text className="text-sm  pl-4 font-asap-medium text-darkPrimaryOrange">
              Educational Level
            </Text>
            <TextInput
              className="border-2 font-asap-regular rounded-full border-gray p-2 mb-4"
              autoCapitalize="none"
              value={educationLevel}
              onChangeText={setEducationLevel}
            />
          </View>
        )}
      </View>
    );
  }
);

export default QuestionDetails;
