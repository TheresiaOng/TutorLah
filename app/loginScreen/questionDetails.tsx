import { useAuth } from "@/contexts/authContext";
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
    const [teachableSubjects, setTeachableSubjects] = useState("");
    const [subjectsToLearn, setSubjectsToLearn] = useState("");

    const usersRef = collection(db, "users");
    const rolesRef = collection(
      usersRef,
      role === "tutor" ? "roles/tutors" : "roles/tutees"
    );

    const { setUserDocID, setUserRole, userDocID, userRole } = useAuth();

    // Reset fields when the role changes
    // This effect runs when the component mounts and whenever the role changes
    useEffect(() => {
      setAchievements("");
      setTeachableSubjects("");
      setSubjectsToLearn("");
    }, [role]);

    const nextPage = () => {
      router.push({
        pathname: "/homeScreen/home",
        params: { id: userDocID, role: userRole },
      });
    };

    const handleNext = async () => {
      if (role === "tutor") {
        if (
          !educationLevel ||
          !achievements ||
          !educationInstitute ||
          !teachableSubjects ||
          !name
        ) {
          onError?.("Please fill all fields for tutor.");
        } else if (email && password) {
          try {
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );
            const docRef = doc(rolesRef, userCredential.user.uid);
            await setDoc(docRef, {
              email,
              name,
              educationLevel,
              educationInstitute,
              achievements,
              teachableSubjects,
            });
            setUserDocID(docRef.id);
            setUserRole(role);
            nextPage();
          } catch (error: any) {
            const errorMessage = errorhandling(error);
            onError?.(errorMessage ?? "");
          }
        } else {
          onError?.("Please enter email and password.");
        }
      } else {
        if (
          !educationLevel ||
          !educationInstitute ||
          !subjectsToLearn ||
          !name
        ) {
          onError?.("Please fill all fields for tutee.");
        } else if (email && password) {
          try {
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );
            const docRef = doc(rolesRef, userCredential.user.uid);
            await setDoc(docRef, {
              email,
              name,
              educationLevel,
              educationInstitute,
              subjectsToLearn,
            });
            setUserDocID(docRef.id);
            setUserRole(role);
            nextPage();
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
              Educational Level
            </Text>
            <TextInput
              className="border-2 font-asap-regular rounded-full border-gray p-2 mb-4"
              autoCapitalize="none"
              value={educationLevel}
              onChangeText={setEducationLevel}
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
              Achievements
            </Text>
            <TextInput
              className="border-2 font-asap-regular rounded-full border-gray p-2 mb-4"
              autoCapitalize="none"
              value={achievements}
              onChangeText={setAchievements}
            />
            <Text className="text-sm pl-4 font-asap-medium text-darkPrimaryBlue">
              Teachable Subjects
            </Text>
            <TextInput
              className="border-2 font-asap-regular rounded-full border-gray p-2 mb-4"
              autoCapitalize="none"
              value={teachableSubjects}
              onChangeText={setTeachableSubjects}
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
              Educational Level
            </Text>
            <TextInput
              className="border-2 font-asap-regular rounded-full border-gray p-2 mb-4"
              autoCapitalize="none"
              value={educationLevel}
              onChangeText={setEducationLevel}
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
            <Text className="text-sm pl-4 font-asap-medium text-darkPrimaryOrange">
              Subjects to Learn
            </Text>
            <TextInput
              className="border-2 font-asap-regular rounded-full border-gray p-2 mb-4"
              autoCapitalize="none"
              value={subjectsToLearn}
              onChangeText={setSubjectsToLearn}
            />
          </View>
        )}
      </View>
    );
  }
);

export default QuestionDetails;
