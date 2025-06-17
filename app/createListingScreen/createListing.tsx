import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import { router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

const CreateListing = () => {
  const [subjects, setSubjects] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [length, setLength] = useState(0);
  const [price, setPrice] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [endPrice, setEndPrice] = useState("");
  const [open, setOpen] = useState(false);
  const [negotiable, setNegotiable] = useState(null);
  const [items, setItems] = useState([
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ]);
  const [errorMsg, setErrorMsg] = useState("");
  const { userDoc } = useAuth();

  const MAX_WORDS = 10;

  const handleSubject = (text: string) => {
    setLength(text.length);
    const words = text.split(",").map((word) => word.trim());

    const nonEmptyWords = words.filter((word) => word !== "");

    if (nonEmptyWords.length > MAX_WORDS) {
      return;
    }

    setSubjects(text);
    setWordCount(nonEmptyWords.length);
  };

  const listingRef = collection(db, "listings");

  const post = async () => {
    if (userDoc?.role === "tutor") {
      if (!subjects || !price || !negotiable) {
        setErrorMsg("Please fill all fields before posting");
        return;
      }

      setErrorMsg("");
      const formattedSubjects = subjects
        .split(",")
        .map((word) => {
          const trimmed = word.trim();
          return (
            trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
          );
        })
        .join(", ");

      try {
        const newListing = await addDoc(listingRef, {
          name: userDoc.name,
          userId: userDoc.userId,
          role: userDoc.role,
          subjects: formattedSubjects,
          price,
          negotiable,
          education: `${userDoc.educationInstitute} ${userDoc.educationLevel}`,
        });
        Alert.alert("Success", "Your listing has been created successfully!");
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to create listing. Please try again later."
        );
        console.error("Error creating listing:", error);
      } finally {
        router.push("/homeScreen/home");
      }
    } else {
      if (!subjects || !startPrice || !endPrice) {
        setErrorMsg("Please fill all fields before posting");
        return;
      }

      if (endPrice < startPrice) {
        setErrorMsg("Starting price must be smaller than ending price");
        return;
      }

      setErrorMsg("");
      const formattedSubjects = subjects
        .split(",")
        .map((word) => {
          const trimmed = word.trim();
          return (
            trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
          );
        })
        .join(", ");

      try {
        const newListing = await addDoc(listingRef, {
          name: userDoc?.name,
          userId: userDoc?.userId,
          role: userDoc?.role,
          subjects: formattedSubjects,
          startPrice,
          endPrice,
          education: `${userDoc?.educationInstitute} ${userDoc?.educationLevel}`,
        });
        Alert.alert("Success", "Your listing has been created successfully!");
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to create listing. Please try again later."
        );
        console.error("Error creating listing:", error);
      } finally {
        router.push("/homeScreen/home");
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 bg-white justify-center items-center">
        {/* Header */}
        <View
          className={`border-8 w-full justify-center items-center h-1/6
        ${
          userDoc?.role === "tutor"
            ? "border-primaryBlue bg-primaryBlue"
            : "border-primaryOrange bg-primaryOrange"
        }`}
        >
          <View className="flex-row w-11/12 items-center inset-y-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="items-center h-full justify-center mr-2"
            >
              <Image
                className="w-10"
                resizeMode="contain"
                source={require("../../assets/images/arrowBack.png")}
              />
            </TouchableOpacity>
            <Text
              className={`${
                userDoc?.role === "tutor" ? "text-white" : "text-darkBrown"
              } font-asap-bold text-3xl`}
            >
              Create Listing
            </Text>
          </View>
        </View>

        <View className="h-4/6 w-full items-center">
          {errorMsg !== "" && (
            <View className="items-center justify-center w-full">
              <Text className="text-sm font-asap-regular mt-4 text-red-500">
                {errorMsg}
              </Text>
            </View>
          )}
          <View className="justify-center w-full px-6 mt-6 items-start">
            {/* Input fields for listing */}
            <View className="w-full h-full items-center">
              <View className="items-start w-full">
                <Text
                  className={`text-sm pl-4 font-asap-medium ${
                    userDoc?.role === "tutor"
                      ? "text-darkPrimaryBlue"
                      : "text-darkPrimaryOrange"
                  }`}
                >
                  Educational Level
                </Text>
                <View
                  className={`border-2 justify-center border-gray flex-wrap font-asap-regular h-14 bg-lightGray rounded-2xl p-2 mb-8 w-full`}
                >
                  <Text className="font-asap-regular">
                    {userDoc?.educationInstitute} {userDoc?.educationLevel}
                  </Text>
                </View>
              </View>
              <View className="items-start w-full">
                {length === 1000 && (
                  <View className="items-center justify-center w-full">
                    <Text className="text-sm font-asap-regular mb-4 text-red-500">
                      You have hit the limit of 1000 characters
                    </Text>
                  </View>
                )}
                <Text
                  className={`text-sm pl-4 font-asap-medium ${
                    userDoc?.role === "tutor"
                      ? "text-darkPrimaryBlue"
                      : "text-darkPrimaryOrange"
                  }`}
                >
                  {userDoc?.role === "tutor"
                    ? "Teaching Subjects"
                    : "Subjects Wanted"}
                </Text>

                <TextInput
                  className={`border-2 border-gray flex-wrap font-asap-regular min-h-14 max-h-32 rounded-2xl p-2 w-full`}
                  placeholderTextColor={"#000"}
                  value={subjects}
                  onChangeText={(text) => handleSubject(text)}
                  autoCapitalize="none"
                  multiline
                  maxLength={1000}
                />
                <View className="flex-row mb-8 w-full">
                  <View className="items-start w-1/3">
                    <Text
                      className={`text-xs pl-4 pt-2 font-asap-medium ${
                        userDoc?.role === "tutor"
                          ? "text-darkBlue"
                          : "text-darkBrown"
                      }`}
                    >
                      Subject Count ({wordCount}/10)
                    </Text>
                  </View>
                  <View className="items-end w-2/3">
                    <Text
                      className={`text-xs pr-4 pt-2 font-asap-medium ${
                        userDoc?.role === "tutor"
                          ? "text-darkBlue"
                          : "text-darkBrown"
                      }`}
                    >
                      Separate each subject with a comma (,)
                    </Text>
                  </View>
                </View>
              </View>
              {userDoc?.role === "tutor" ? (
                <View className="items-start w-full">
                  <Text className="text-sm pl-4 font-asap-medium text-darkPrimaryBlue">
                    Pricing per Hour
                  </Text>
                  <View className="flex-row items-center border-2 h-14 border-gray mb-8 rounded-2xl p-2 w-full">
                    <Text className="text-lg font-asap-regular mr-1">S$</Text>
                    <TextInput
                      className={`font-asap-regular flex-1`}
                      placeholderTextColor={"#000"}
                      value={price.toString()}
                      onChangeText={setPrice}
                      autoCapitalize="none"
                      keyboardType="numeric"
                      maxLength={19}
                    />
                  </View>
                  <View className="items-start w-full">
                    <Text
                      className={`text-sm pl-4 font-asap-medium ${
                        userDoc?.role === "tutor"
                          ? "text-darkPrimaryBlue"
                          : "text-darkPrimaryOrange"
                      }`}
                    >
                      Negotiable Pricing
                    </Text>
                    <DropDownPicker
                      open={open}
                      value={negotiable}
                      items={items}
                      setOpen={setOpen}
                      setValue={setNegotiable}
                      setItems={setItems}
                      placeholder="Please select one"
                      style={{
                        borderColor: "#8e8e93",
                        borderWidth: 2,
                        borderRadius: 16,
                      }}
                      dropDownContainerStyle={{
                        borderColor: "#8e8e93",
                        borderWidth: 2,
                      }}
                      textStyle={{
                        fontFamily: "Asap-Regular",
                        fontSize: 13,
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View className="items-start w-full">
                  <Text className="text-sm pl-4 font-asap-medium text-darkPrimaryOrange">
                    Price Range per Hour
                  </Text>
                  <View className="flex-row items-center justify-center w-full">
                    <View className="flex-row items-center border-2 h-14 border-gray mb-8 rounded-2xl p-2 w-2/5">
                      <Text className="text-lg font-asap-regular mr-1">S$</Text>
                      <TextInput
                        className={`font-asap-regular flex-1`}
                        placeholderTextColor={"#8e8e93"}
                        placeholder="From"
                        value={startPrice.toString()}
                        onChangeText={setStartPrice}
                        autoCapitalize="none"
                        keyboardType="numeric"
                        maxLength={19}
                      />
                    </View>
                    <View className="items-center w-1/5">
                      <Text className="text-4xl font-asap-bold -inset-y-4 text-darkPrimaryOrange">
                        -
                      </Text>
                    </View>
                    <View className="flex-row items-center border-2 h-14 border-gray mb-8 rounded-2xl p-2 w-2/5">
                      <Text className="text-lg font-asap-regular mr-1">S$</Text>
                      <TextInput
                        className={`font-asap-regular flex-1`}
                        placeholderTextColor={"#8e8e93"}
                        placeholder="To"
                        value={endPrice.toString()}
                        onChangeText={setEndPrice}
                        autoCapitalize="none"
                        keyboardType="numeric"
                        maxLength={19}
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
        <View className="h-1/5 w-full justify-center">
          <View className="px-6 w-full">
            <TouchableOpacity
              className={`${
                userDoc?.role === "tutor"
                  ? "bg-secondaryBlue"
                  : "bg-secondaryOrange"
              } w-full items-center py-3 rounded-xl`}
              onPress={post}
            >
              <Text
                className={`${
                  userDoc?.role === "tutor" ? "text-darkBlue" : "text-darkBrown"
                } font-asap-bold`}
              >
                Post
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CreateListing;

const styles = StyleSheet.create({});
