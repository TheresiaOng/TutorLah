import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, ScrollView, Text, TextInput, View } from "react-native";

type QuestionsScreenProps = {
  role: "tutor" | "tutee";
};

const QuestionsScreen = ({ role }: QuestionsScreenProps) => {
  const [educationLevel, setEducationLevel] = useState("");
  const [educationInstitute, setEducationInstitute] = useState("");
  const [achievements, setAchievements] = useState("");
  const [teachableSubjects, setTeachableSubjects] = useState("");
  const [subjectsToLearn, setSubjectsToLearn] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Reset fields when the role changes
  // This effect runs when the component mounts and whenever the role changes
  useEffect(() => {
    setEducationLevel("");
    setEducationInstitute("");
    setAchievements("");
    setTeachableSubjects("");
    setSubjectsToLearn("");
    setErrorMsg("");
  }, [role]);

  const handleNext = () => {
    // Handle the next action based on the role and input values
    if (role === "tutor") {
      if (
        !educationLevel ||
        !achievements ||
        !educationInstitute ||
        !teachableSubjects
      ) {
        setErrorMsg("Please fill all fields for tutor.");
      } else {
        router.push("/HomeScreen");
      }
    } else {
      if (!educationLevel || !educationInstitute || !subjectsToLearn) {
        setErrorMsg("Please fill all fields for tutee.");
      } else {
        router.push("/HomeScreen");
      }
    }
  };

  return (
    <ScrollView className="bg-white px-6 pt-10">
      {errorMsg != "" && (
        <Text className="text-center text-sm mb-6 text-red-500">
          {errorMsg}
        </Text>
      )}
      {role === "tutor" ? (
        <View className="space-y-4">
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
      <Button title="Next" onPress={() => handleNext()}></Button>
    </ScrollView>
  );
};

export default QuestionsScreen;
