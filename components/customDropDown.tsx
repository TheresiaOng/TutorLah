import { useAuth } from "@/contexts/AuthProvider";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

type CustomDropDownProps = {
  options: string[];
  onSelect: (value: string | string[]) => void;
  selected: string | string[] | null;
  multiple?: boolean;
};

const CustomDropDown = ({
  options,
  onSelect,
  selected,
  multiple = false,
}: CustomDropDownProps) => {
  const [showOptions, setShowOptions] = useState(false);
  const [multiSelected, setMultiSelected] = useState<string[]>(
    Array.isArray(selected) ? selected : []
  );
  const { userDoc } = useAuth();

  useEffect(() => {
    if (multiple && Array.isArray(selected)) {
      setMultiSelected(selected);
    }
  }, [selected, multiple]);

  const handleDropDown = () => {
    onSelect(multiSelected);
    setShowOptions(!showOptions);
  };

  const handleSelect = (option: string) => {
    if (multiple) {
      let updated = [...multiSelected];
      if (multiSelected.includes(option)) {
        updated = updated.filter((item) => item !== option);
      } else {
        updated.push(option);
      }
      setMultiSelected(updated);
    } else {
      onSelect(option);
      setShowOptions(false);
    }
  };

  const confirmMultiSelect = () => {
    onSelect(multiSelected);
    setShowOptions(false);
  };

  const isSelected = (option: string) =>
    multiple ? multiSelected.includes(option) : selected === option;

  const selectedLabel = multiple
    ? multiSelected.length > 0
      ? multiSelected.join(", ")
      : "Select options"
    : Array.isArray(selected) && selected.length > 0
    ? selected.join(", ")
    : selected || "Select an option";

  return (
    <View className="">
      <TouchableOpacity
        className="bg-white border-2 border-gray rounded-xl p-3"
        onPress={handleDropDown}
      >
        <View className="flex-row justify-between items-center">
          {multiple && multiSelected.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {multiSelected.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: "#ebebeb",
                    borderRadius: 20,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    marginRight: 8,
                  }}
                >
                  <Text style={{ fontFamily: "Asap-Regular", color: "#333" }}>
                    {item}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text className="font-asap-regular text-black">
              {selectedLabel}
            </Text>
          )}
          <Image
            className="ml-2 w-5 h-5"
            resizeMode="contain"
            source={
              showOptions
                ? require("../assets/images/arrowUp.png")
                : require("../assets/images/arrowDown.png")
            }
          />
        </View>
      </TouchableOpacity>

      {showOptions && (
        <>
          <View className="bg-white border-2 border-gray rounded-xl p-3">
            <ScrollView style={{ maxHeight: 200 }}>
              {options.map((option, index) => (
                <View key={index} className="border-b-2 border-gray mb-1">
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.option,
                      isSelected(option) &&
                        (userDoc?.role === "tutor"
                          ? styles.optionSelectedTutor
                          : styles.optionSelectedTutee),
                    ]}
                    onPress={() => handleSelect(option)}
                  >
                    <Text className="font-asap-regular text-black">
                      {option}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
          {multiple && (
            <TouchableOpacity
              className={`${
                userDoc?.role == "tutor"
                  ? "bg-secondaryBlue"
                  : "bg-secondaryOrange"
              } p-2 rounded-md mt-2 items-center`}
              onPress={confirmMultiSelect}
            >
              <Text
                className={`font-asap-medium ${
                  userDoc?.role == "tutor" ? "text-darkBlue" : "text-darkBrown"
                }`}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

export default CustomDropDown;

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
