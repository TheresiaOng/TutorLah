import React, { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

type CustomSearchBarProps = {
  data: any[];
  searchFields: string[];
  onResult: (result: any[]) => void;
  onQueryChange: (query: string) => void;
  filter?: boolean;
  onFilterPress?: () => void;
};

const CustomSearchBar = ({
  data,
  searchFields,
  onResult,
  onQueryChange,
  filter = false,
  onFilterPress,
}: CustomSearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    onQueryChange(searchQuery);

    const timeout = setTimeout(() => {
      if (searchQuery.trim() === "") {
        onResult(data);
        return;
      }

      // To filter everything else except roles
      const selectedSearchFields = searchFields.filter(
        (field) => !field.startsWith("role:")
      );

      const filtered = data.filter((doc) => {
        const fieldsToSearch =
          selectedSearchFields.length > 0
            ? searchFields
            : Object.keys(doc).filter((key) => !["userId"].includes(key));

        return fieldsToSearch.some((field) =>
          String(doc[field] || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      });

      onResult(filtered);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, data, searchFields]);

  return (
    <View className="flex-1 items-center justify-center">
      <View
        style={[styles.shadow]}
        className="flex-row items-center h-14 mt-4 bg-white rounded-2xl p-2 w-11/12"
      >
        <Image
          className="w-8 ml-2"
          resizeMode="contain"
          source={require("../assets/images/search.png")}
        />
        <TextInput
          className="bg-white font-asap-regular p-4 rounded-full h-14 flex-1"
          placeholder="Search"
          placeholderTextColor="#8e8e93"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {filter && (
          <TouchableOpacity onPress={onFilterPress}>
            <Image
              className="w-6 mr-4"
              resizeMode="contain"
              source={require("../assets/images/filter.png")}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomSearchBar;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
});
