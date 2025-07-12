import { auth, db } from "@/firebase";
import Constants from "expo-constants";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Alert, Text, TextInput, View } from "react-native";
import errorhandling from "./errorhandling";

const STREAM_SECRET_KEY = Constants.expoConfig?.extra?.STREAM_SECRET_KEY;

type QuestionDetailsProps = {
  role: "tutor" | "tutee";
  email: string;
  password: string;
  onError?: (error: string) => void;
  next: () => void;
  onChangeComplete: (complete: boolean) => void;
  setLoading: (loading: boolean) => void;
};

export type QuestionDetailsRef = {
  submit: () => void;
};

const QuestionDetails = forwardRef<QuestionDetailsRef, QuestionDetailsProps>(
  (
    { role, email, password, onChangeComplete, setLoading, onError, next },
    ref
  ) => {
    const [name, setName] = useState("");
    const [educationLevel, setEducationLevel] = useState("");
    const [educationInstitute, setEducationInstitute] = useState("");
    const [achievements, setAchievements] = useState("");

    const usersRef = collection(db, "users");

    // Change button visibility based on fields filled or not
    useEffect(() => {
      const isComplete =
        name.trim() !== "" &&
        educationLevel.trim() !== "" &&
        educationInstitute.trim() !== "" &&
        email.trim() !== "" &&
        password.trim() !== "";

      onChangeComplete(isComplete);
    }, [name, educationLevel, educationInstitute, email, password]);

    // Reset fields when the role changes
    // This effect runs when the component mounts and whenever the role changes
    useEffect(() => {
      setAchievements("");
    }, [role]);

    const handleNext = async () => {
      if (role === "tutor") {
        try {
          setLoading(true);
          await auth.signOut();

          // Creating user for firebase auth
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

          if (auth.currentUser && !auth.currentUser.emailVerified) {
            await sendEmailVerification(auth.currentUser);

            Alert.alert(
              "Verify Email",
              "A verification link has been sent to your email. Please verify to continue."
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
              verified: false,
            });

            router.push({
              pathname: "./verifyEmail",
              params: { email, password },
            });
            setLoading(false);
          } else {
            router.push("/homeScreen/home");
            setLoading(false);
          }
        } catch (error: any) {
          const errorMessage = errorhandling(error);
          Alert.alert("Error", errorMessage);
          setLoading(false);
        }
      } else {
        try {
          setLoading(true);
          await auth.signOut();

          // Creating user for firebase auth
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

          if (auth.currentUser && !auth.currentUser.emailVerified) {
            await sendEmailVerification(auth.currentUser);

            Alert.alert(
              "Verify Email",
              "A verification link has been sent to your email. Please verify to continue."
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
              verified: false,
            });

            router.push("./verifyEmail");
            setLoading(false);
          } else {
            router.push("/homeScreen/home");
            setLoading(false);
          }
        } catch (error: any) {
          const errorMessage = errorhandling(error);
          Alert.alert("Error", errorMessage);
          setLoading(false);
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
