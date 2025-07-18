import { useAuth } from "@/contexts/AuthProvider";
import useDebounce from "@/hooks/useDebounce";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";

type CustomSearchDropDownProps = {
  source: string[];
  placeHolder?: string;
  onChange: (value: string[]) => void;
  selected: string[];
};

const CustomSearchDropDown = ({
  source,
  placeHolder = "Search",
  onChange,
  selected,
}: CustomSearchDropDownProps) => {
  const [input, setInput] = useState("");
  const [filteredSource, setFilteredSource] = useState<string[]>([]);

  const { userDoc } = useAuth();
  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    const filtered = source.filter(
      (subject) =>
        typeof subject === "string" &&
        subject.toLowerCase().includes(debouncedInput.toLowerCase())
    );
    setFilteredSource(filtered);
    console.log("Subject pool filtered", filtered);
  }, [debouncedInput, source]);

  const isSelected = (option: string) => selected?.includes(option);

  const handleSelect = (option: string) => {
    let updated = [...selected];
    if (selected.includes(option)) {
      updated = updated.filter((item) => item !== option);
    } else {
      updated.push(option);
    }
    onChange(updated);
  };

  const handleAddSubject = () => {
    if (!input.trim()) return;

    const lower = input.toLowerCase();
    const updated = [...selected, lower];
    onChange(updated);
    setInput("");
  };

  const handleDeleteSubject = (item: string) => {
    let updated = [...selected];
    updated = updated.filter((subject) => subject !== item);
    onChange(updated);
  };

  return (
    <KeyboardAvoidingView>
      {selected && selected.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[...selected].reverse().map((item, idx) => (
            <View
              key={idx}
              style={{
                backgroundColor: "#ebebeb",
                borderRadius: 20,
                paddingVertical: 6,
                paddingHorizontal: 12,
                marginRight: 8,
                marginBottom: 12,
              }}
              className="flex-row items-center"
            >
              <Text style={{ fontFamily: "Asap-Regular", color: "#333" }}>
                {item}
              </Text>
              <TouchableOpacity onPress={() => handleDeleteSubject(item)}>
                <Image
                  className="w-5 h-5 ml-2"
                  resizeMode="contain"
                  source={require("../assets/images/cancelGray.png")}
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      <View className="flex-row items-center h-14 border-gray border-2 bg-white rounded-2xl p-2">
        <Image
          className="w-8 ml-2"
          resizeMode="contain"
          source={require("../assets/images/search.png")}
        />
        <TextInput
          className="bg-white font-asap-regular pl-4 rounded-full h-12 flex-1"
          placeholder={placeHolder}
          placeholderTextColor="#8e8e93"
          value={input}
          onChangeText={setInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {debouncedInput && filteredSource.length > 0 && (
        <View className="bg-white border-2 border-gray rounded-xl p-3">
          <ScrollView style={{ maxHeight: 200 }}>
            {filteredSource.map((subject, index) => (
              <View key={index} className="border-b-2 border-gray mb-1">
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    isSelected(subject) &&
                      (userDoc?.role === "tutor"
                        ? styles.optionSelectedTutor
                        : styles.optionSelectedTutee),
                  ]}
                  onPress={() => handleSelect(subject)}
                >
                  <Text className="font-asap-regular text-black">
                    {subject}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      {debouncedInput && (
        <TouchableOpacity
          className={`${
            userDoc?.role == "tutor" ? "bg-secondaryBlue" : "bg-secondaryOrange"
          } p-2 rounded-md mt-2 items-center`}
          onPress={handleAddSubject}
        >
          <Text
            className={`font-asap-medium ${
              userDoc?.role == "tutor" ? "text-darkBlue" : "text-darkBrown"
            }`}
          >
            Add subject
          </Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

export default CustomSearchDropDown;

const styles = StyleSheet.create({
  option: {
    paddingVertical: 10,
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  optionSelectedTutee: {
    backgroundColor: "#FFEFC3",
    borderRadius: 8,
  },
  optionSelectedTutor: {
    backgroundColor: "#D8ECFF",
    borderRadius: 8,
  },
});
