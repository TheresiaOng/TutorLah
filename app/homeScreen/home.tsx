import CustomButton from "@/components/customButton";
import CustomDropDown from "@/components/customDropDown";
import CustomSearchBar from "@/components/customSearchBar";
import { useAuth } from "@/contexts/AuthProvider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import {
  collection,
  onSnapshot,
  query,
  Query,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { db } from "../../firebase";
import NullScreen from "../nullScreen";
import TuteeCard from "./tuteeCard";
import TutorCard from "./tutorCard";

type Listing = {
  listId: string;
  role: "tutor" | "tutee";
  subjects: string;
  date: string[];
  teachingLevel: string[];
  startTime: string;
  endTime: string;
  totalRating: number;
  reviewCount: number;
};

const HomeScreen = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Listing[]>([]);
  const [searchFields, setSearchFields] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [subjectRanking, setSubjectRanking] = useState<Map<string, number>>(
    new Map()
  );
  const [loadingMatching, setLoadingMatching] = useState(false);

  // filtering
  const [openFilter, setOpenFilter] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["75%"], []);
  const [filterTeachingLevel, setFilterTeachingLevel] = useState<string[]>([]);
  const [filterDay, setFilterDay] = useState<string[]>([]);
  const [filterStartTime, setFilterStartTime] = useState<Date | null>(null);
  const [tempStartTime, setTempStartTime] = useState<Date>(new Date());
  const [filterEndTime, setFilterEndTime] = useState<Date | null>(null);
  const [tempEndTime, setTempEndTime] = useState<Date>(new Date());
  const [showFilterStartTime, setShowFilterStartTime] = useState(false);
  const [showFilterEndTime, setShowFilterEndTime] = useState(false);
  const [startPrice, setStartPrice] = useState("");
  const [endPrice, setEndPrice] = useState("");
  const [filterPrice, setFilterPrice] = useState("");
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [filterRating, setFilterRating] = useState("");
  const [loadingReset, setLoadingReset] = useState(false);

  const { userDoc } = useAuth();
  if (!userDoc) return <NullScreen />;

  // Supabase client setup
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

  const handleFilterPress = () => {
    if (openFilter) {
      bottomSheetRef.current?.close();
      setOpenFilter(false);
    } else {
      bottomSheetRef.current?.present();
      setOpenFilter(true);
    }
  };

  const handleApplyFilter = () => {
    setLoadingFilter(true);

    // ensure endTime > startTime and must be minimum 1 hour
    if (filterStartTime && filterEndTime) {
      const startMillis = filterStartTime.getTime();
      const endMillis = filterEndTime.getTime();

      const durationInHours = (endMillis - startMillis) / (1000 * 60 * 60);
      if (durationInHours <= 0) {
        Alert.alert("Time Error", "End time must be later than start time");
        setLoadingFilter(false);
        return;
      } else if (durationInHours < 0.99 && durationInHours > 0) {
        Alert.alert("Time Error", "Minimum time range must be 1 hour.");
        setLoadingFilter(false);
        return;
      }
    }

    // ensure both start and end price must be filled or none
    if (
      (startPrice != "" && endPrice == "") ||
      (startPrice == "" && endPrice != "")
    ) {
      Alert.alert("Price Error", "Please complete the price range.");
      setLoadingFilter(false);
      return;
    }

    // ensure start price is <= end price
    if (startPrice != "" && endPrice != "" && endPrice < startPrice) {
      Alert.alert(
        "Price Error",
        "Starting price must be less than or equal to ending price."
      );
      setLoadingFilter(false);
      return;
    }

    // Always start from full listings
    let filtered = [...listings];

    // Apply searchQuery if active
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        item.subjects.toLowerCase().includes(lowerQuery)
      );
    }

    // filter based on teaching level
    if (filterTeachingLevel.length > 0) {
      filtered = filtered.filter((item) =>
        item.teachingLevel?.some((level) => filterTeachingLevel.includes(level))
      );
    }

    // filter based on day availability
    if (filterDay.length > 0) {
      filtered = filtered.filter((item) =>
        item.date?.some((day) => filterDay.includes(day))
      );
    }

    // filter based on time availability
    if (filterStartTime || filterEndTime) {
      const getMinutes = (date: Date): number =>
        date.getHours() * 60 + date.getMinutes();

      const parseTimeStringToMinutes = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const filterStartMinutes = filterStartTime
        ? getMinutes(filterStartTime)
        : null;
      const filterEndMinutes = filterEndTime ? getMinutes(filterEndTime) : null;

      filtered = filtered.filter((item) => {
        if (!item.startTime || !item.endTime) return false;

        const itemStartMinutes = parseTimeStringToMinutes(item.startTime);
        const itemEndMinutes = parseTimeStringToMinutes(item.endTime);

        if (filterStartMinutes !== null && filterEndMinutes !== null) {
          // Show listings that overlap with the filter range
          return (
            itemEndMinutes > filterStartMinutes &&
            itemStartMinutes < filterEndMinutes
          );
        } else if (filterStartMinutes !== null) {
          // Show listings that are still available at filter start time
          return itemEndMinutes > filterStartMinutes;
        } else if (filterEndMinutes !== null) {
          // Show listings that start before or at the end time
          return itemStartMinutes < filterEndMinutes;
        }

        return true;
      });
    }

    // filter based on price (start and end)
    if (startPrice !== "" && endPrice !== "") {
      const min = parseFloat(startPrice);
      const max = parseFloat(endPrice);

      filtered = filtered.filter((item: any) => {
        if (userDoc?.role === "tutor") {
          const itemStartPrice = parseFloat(item.startPrice);
          const itemEndPrice = parseFloat(item.endPrice);

          return (
            !isNaN(itemStartPrice) &&
            !isNaN(itemEndPrice) &&
            itemStartPrice >= min &&
            itemEndPrice <= max
          );
        } else {
          const itemPrice = parseFloat(item.price);
          return !isNaN(itemPrice) && itemPrice >= min && itemPrice <= max;
        }
      });
    }

    // Sort price filtering by ascending or descending
    if (filterPrice === "Ascending") {
      if (userDoc?.role === "tutor") {
        // Tutors are viewing tutees → sort by startPrice (or average)
        filtered.sort(
          (a: any, b: any) =>
            parseFloat(a.startPrice) - parseFloat(b.startPrice)
        );
      } else {
        // Tutees are viewing tutors → sort by price
        filtered.sort(
          (a: any, b: any) => parseFloat(a.price) - parseFloat(b.price)
        );
      }
    } else if (filterPrice === "Descending") {
      if (userDoc?.role === "tutor") {
        filtered.sort(
          (a: any, b: any) =>
            parseFloat(b.startPrice) - parseFloat(a.startPrice)
        );
      } else {
        filtered.sort(
          (a: any, b: any) => parseFloat(b.price) - parseFloat(a.price)
        );
      }
    }

    if (filterRating !== "") {
      const minRating = parseFloat(filterRating);

      filtered = filtered.filter((item) => {
        const hasReviews = item.reviewCount > 0;
        const averageRating = hasReviews
          ? item.totalRating / item.reviewCount
          : 0;
        return !isNaN(averageRating) && averageRating >= minRating;
      });
    }

    setSearchResults(filtered);
    setLoadingFilter(false);
    Alert.alert("Success", "Filters have been applied successfully!");
    setOpenFilter(false);
    bottomSheetRef.current?.close();
  };

  const handleResetFilter = () => {
    setLoadingReset(true);
    setSearchQuery("");
    setSearchResults([]);
    setFilterTeachingLevel([]);
    setFilterDay([]);
    setFilterStartTime(null);
    setFilterEndTime(null);
    setStartPrice("");
    setEndPrice("");
    setFilterPrice("");
    setFilterRating("");
    Alert.alert("Success", "Filters have been resetted.");
    setLoadingReset(false);
  };

  useEffect(() => {
    const fetchMatchingSubjects = async () => {
      setLoadingMatching(true);
      console.log("Running match_subjects with embedding of", userDoc.name);

      const isTutor = userDoc?.role === "tutor";
      const userEmbedding = isTutor
        ? userDoc.embeddedSubjectToTeach
        : userDoc.embeddedSubjectToLearn;

      if (!userEmbedding) {
        setLoadingMatching(false); // <-- ADD THIS LINE
        return;
      }

      // call supabase table function to match subject based on users' preferences
      const { data, error } = await supabase.rpc("match_subjects", {
        user_embedding: userEmbedding,
        match_limit: 10, // take the top 10 subjects
        user_role: userDoc?.role,
        similarity_threshold: 0.5,
      });

      if (error) {
        console.error("Error calling match_subjects:", error);
        setLoadingMatching(false);
        return;
      }

      if (!data || data.length === 0) {
        console.warn(
          "No matched subjects found. Falling back to default sorting."
        );
        setSubjectRanking(new Map()); // reset to empty map = default fallback
        setLoadingMatching(false);
        return;
      }

      // rank each subject based on similarity / match
      const ranked = new Map<string, number>();
      (
        data as {
          name: string;
          similarity: number; // how similar the subject to user's preferences
          availability_score: number; // how many of this subject is available
        }[]
      ).forEach((item) => {
        // combine similarity and availability_score for smarter ranking
        const weightedScore = item.similarity * item.availability_score;
        ranked.set(item.name.toLowerCase(), weightedScore);
      });

      setSubjectRanking(ranked);
      setLoadingMatching(false);
    };

    fetchMatchingSubjects();
  }, [userDoc]);

  useEffect(() => {
    // Fetching photo_url from Supabase
    const fetchData = async () => {
      if (!userDoc?.userId) return; // Ensure id is available
      const { data, error } = await supabase
        .from("profiles")
        .select("photo_url")
        .eq("id", userDoc.userId)
        .single();

      if (error) {
        console.log("No photo uploaded yet, using default image");
      } else {
        console.log("Photo URL:", data?.photo_url);
        setPhotoUrl(data?.photo_url || null); // Set photoUrl state
      }
    };
    fetchData();
  }, [userDoc]);

  useEffect(() => {
    let listingsQuery: Query = collection(db, "listings"); // Query to fetch listings
    const oppositeRole = userDoc.role === "tutor" ? "tutee" : "tutor";
    listingsQuery = query(listingsQuery, where("role", "==", oppositeRole)); // Filter listings by opposite role

    const unsubscribe = onSnapshot(listingsQuery, (snapshot) => {
      const fetchedListings: Listing[] = snapshot.docs.map((doc) => ({
        listId: doc.id,
        ...(doc.data() as Omit<Listing, "listId">),
      }));
      setListings(fetchedListings);
    });

    return () => unsubscribe();
  }, [userDoc]);

  // give each subject a score if it does not have a score, mark it 0
  // 0 means it will be displayed at the bottom
  const scoreListing = (subjects: string): number => {
    const subjectList = subjects.split(",").map((s) => s.trim().toLowerCase());

    const total = subjectList.reduce(
      (score, s) => score + (subjectRanking.get(s) || 0),
      0
    );

    // Diminishing returns to avoid people listing more subjects just to be put at the top
    return Math.log(1 + total);
  };

  // sort the listing based on its score
  // the higher the score, the higher the placement
  // only if no filters / search available
  const sortedListings = useMemo(() => {
    const filtersApplied =
      filterTeachingLevel.length > 0 ||
      filterDay.length > 0 ||
      filterStartTime !== null ||
      filterEndTime !== null ||
      startPrice !== "" ||
      endPrice !== "" ||
      filterPrice !== "" ||
      filterRating !== "";

    if (filtersApplied || searchQuery.trim() !== "") {
      return searchResults;
    }

    // fallback to subject ranking sort if no filters/search
    return [...listings].sort(
      (a, b) => scoreListing(b.subjects) - scoreListing(a.subjects)
    );
  }, [
    listings,
    searchQuery,
    searchResults,
    JSON.stringify([...subjectRanking]),
    filterDay,
    filterStartTime,
    filterEndTime,
    startPrice,
    endPrice,
    filterPrice,
    filterRating,
  ]);

  return (
    <View className="flex-1 bg-white justify-center items-center">
      {/* Header */}
      {userDoc?.role === "tutor" ? (
        <View className="border-8 border-primaryBlue bg-primaryBlue w-full justify-center items-center h-60">
          <View className="flex-row w-11/12 items-center inset-y-8">
            <View
              className={`mr-4 items-center justify-center rounded-full ${
                photoUrl ? "h-20 w-20" : "h-20 w-20 bg-white"
              } overflow-hidden`}
            >
              <Image
                source={
                  photoUrl
                    ? { uri: photoUrl }
                    : require("../../assets/images/hatLogo.png")
                }
                className={`h-20 w-20 rounded-full border-2 border-white ${
                  !photoUrl && "p-2 mt-2"
                }`}
                resizeMode="cover"
              />
            </View>
            <Text
              numberOfLines={1} // Ensuring only one-line name display
              ellipsizeMode="tail" // Adding "..." at the end for the remainder of letters
              className="text-4xl w-4/5 pl-4 font-asap-bold color-white"
            >
              {userDoc?.name || "User"}
            </Text>
          </View>
        </View>
      ) : (
        <View className="border-8 border-primaryOrange bg-primaryOrange w-full justify-center items-center h-60">
          <View className="flex-row w-11/12 items-center inset-y-8">
            <View
              className={`mr-4 items-center justify-center rounded-full ${
                photoUrl ? "h-20 w-20" : "h-20 w-20 bg-white"
              } overflow-hidden`}
            >
              <Image
                source={
                  photoUrl
                    ? { uri: photoUrl }
                    : require("../../assets/images/hatLogo.png")
                }
                className={`h-20 w-20 rounded-full border-2 border-white ${
                  !photoUrl && "p-2 mt-2"
                }`}
                resizeMode="cover"
              />
            </View>
            <Text className="text-4xl w-4/5 pl-4 color-darkBrown font-asap-bold">
              {userDoc ? userDoc.name : "User"}
            </Text>
          </View>
        </View>
      )}
      {/* Card display logic */}
      <CustomSearchBar
        data={listings}
        searchFields={searchFields}
        onResult={setSearchResults}
        onQueryChange={setSearchQuery}
        filter
        onFilterPress={handleFilterPress}
      />

      <View className="h-5/6 w-full justify-center items-center">
        {/* Loading indicator */}
        {loadingMatching && (
          <View className="items-center flex-col justify-center w-full h-full">
            <ActivityIndicator size="large" />
            <Text className="font-asap-medium mt-4">Loading listings...</Text>
          </View>
        )}

        {/* No search found text */}
        {(sortedListings || searchQuery.trim() !== "") &&
        sortedListings.length === 0 ? (
          <Text className="text-center mb-12 text-gray text-lg font-asap-regular">
            No results found
          </Text>
        ) : (
          <FlatList
            key={subjectRanking.size} // This forces rerender when subjectRanking updates
            data={sortedListings}
            keyExtractor={(item) => item.listId} //every flatlist need a unique key id
            renderItem={({ item }) => {
              return item.role === "tutee" ? (
                <View className="items-center px-6 w-screen">
                  <TuteeCard item={item} listId={item.listId} />
                </View>
              ) : (
                <View className="items-center px-6 w-screen">
                  <TutorCard item={item} listId={item.listId} />
                </View>
              );
            }}
            className="mt-16 mb-16"
            ItemSeparatorComponent={() => <View className="h-4" />} // Adds vertical spacing
          />
        )}
      </View>

      {/* Filtering Bottom Screen */}
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={0}
        backgroundStyle={{
          borderRadius: 20,
          shadowRadius: 5,
          shadowOpacity: 0.3,
        }}
      >
        <View className="px-4 items-center">
          <Text
            className={`font-asap-bold mb-2 text-3xl ${
              userDoc?.role == "tutor"
                ? "text-primaryBlue"
                : "text-primaryOrange"
            }`}
          >
            Filter Listings
          </Text>
          <ScrollView
            className="h-4/5 w-full mb-4 pt-4"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {userDoc?.role == "tutee" && (
              // Filter by Teaching Level
              <>
                <View className="flex-row justify-between items-center w-full">
                  <Text
                    className={`pl-4 font-asap-medium ${
                      userDoc?.role == "tutor"
                        ? "text-darkPrimaryBlue"
                        : "text-darkPrimaryOrange"
                    }`}
                  >
                    Teaching Level
                  </Text>
                  {filterTeachingLevel.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setFilterTeachingLevel([]);
                      }}
                      className="ml-2 p-1 mb-2 bg-red-500 rounded-full"
                    >
                      <Image
                        className="w-5 h-5"
                        resizeMode="contain"
                        source={require("@/assets/images/cancel.png")}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <CustomDropDown
                  options={[
                    "Primary",
                    "Secondary",
                    "Poly",
                    "JC",
                    "IB",
                    "University/College",
                  ]}
                  selected={filterTeachingLevel}
                  onSelect={(values) => {
                    if (Array.isArray(values)) {
                      setFilterTeachingLevel(values);
                    }
                  }}
                  multiple
                />
              </>
            )}

            {/* Filter by Days */}
            <View className="flex-row justify-between mt-4 items-center w-full">
              <Text
                className={`pl-4 font-asap-medium ${
                  userDoc?.role == "tutor"
                    ? "text-darkPrimaryBlue"
                    : "text-darkPrimaryOrange"
                }`}
              >
                Available Days
              </Text>
              {filterDay.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setFilterDay([]);
                  }}
                  className="ml-2 p-1 mb-2 bg-red-500 rounded-full"
                >
                  <Image
                    className="w-5 h-5"
                    resizeMode="contain"
                    source={require("@/assets/images/cancel.png")}
                  />
                </TouchableOpacity>
              )}
            </View>
            <CustomDropDown
              options={[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ]}
              selected={filterDay}
              onSelect={(values) => {
                if (Array.isArray(values)) {
                  setFilterDay(values);
                }
              }}
              multiple
            />

            {/* Filter by start time and end time */}
            <Text
              className={`pl-4 mt-4 font-asap-medium ${
                userDoc?.role == "tutor"
                  ? "text-darkPrimaryBlue"
                  : "text-darkPrimaryOrange"
              }`}
            >
              Start Time
            </Text>
            {!showFilterStartTime ? (
              <View className="flex-row justify-between items-center w-full">
                <TouchableOpacity
                  onPress={() => {
                    setShowFilterStartTime(true);
                    setShowFilterEndTime(false);
                  }}
                  className="flex-1"
                >
                  <Text style={styles.input}>
                    {filterStartTime
                      ? filterStartTime.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                      : "Select Start Time"}
                  </Text>
                </TouchableOpacity>

                {filterStartTime !== null && (
                  <TouchableOpacity
                    onPress={() => setFilterStartTime(null)}
                    className="ml-2 p-1 mb-4 bg-red-500 rounded-full"
                  >
                    <Image
                      className="w-5 h-5"
                      resizeMode="contain"
                      source={require("@/assets/images/cancel.png")}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View className="flex-1 items-center">
                <DateTimePicker
                  value={tempStartTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedTime) => {
                    if (selectedTime) {
                      setTempStartTime(selectedTime);
                    }
                  }}
                  textColor="black"
                />

                <CustomButton
                  title="Confirm Start Time"
                  role="tutee"
                  onPress={() => {
                    setFilterStartTime(tempStartTime);
                    setShowFilterStartTime(false);
                  }}
                />
              </View>
            )}
            <Text
              className={`pl-4 mt-1 font-asap-medium ${
                userDoc?.role == "tutor"
                  ? "text-darkPrimaryBlue"
                  : "text-darkPrimaryOrange"
              }`}
            >
              End Time
            </Text>
            {!showFilterEndTime ? (
              <View className="flex-row justify-between items-center w-full">
                <TouchableOpacity
                  onPress={() => {
                    setShowFilterEndTime(true);
                    setShowFilterStartTime(false);
                  }}
                  className="flex-1"
                >
                  <Text style={styles.input}>
                    {filterEndTime
                      ? filterEndTime.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                      : "Select End Time"}
                  </Text>
                </TouchableOpacity>

                {filterEndTime !== null && (
                  <TouchableOpacity
                    onPress={() => setFilterEndTime(null)}
                    className="ml-2 p-1 mb-4 bg-red-500 rounded-full"
                  >
                    <Image
                      className="w-5 h-5"
                      resizeMode="contain"
                      source={require("@/assets/images/cancel.png")}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View className="flex-1 items-center">
                <DateTimePicker
                  value={tempEndTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedTime) => {
                    if (selectedTime) {
                      setTempEndTime(selectedTime);
                    }
                  }}
                  textColor="black"
                />

                <CustomButton
                  title="Confirm End Time"
                  role="tutee"
                  onPress={() => {
                    setFilterEndTime(tempEndTime);
                    setShowFilterEndTime(false);
                  }}
                />
              </View>
            )}

            {/* Filter by start and end price */}
            <View className="flex-row mt-2 justify-between">
              <Text
                className={`pl-4 mt-1 mb-2 font-asap-medium ${
                  userDoc?.role == "tutor"
                    ? "text-darkPrimaryBlue"
                    : "text-darkPrimaryOrange"
                }`}
              >
                Price Range per Hour
              </Text>
              <View className="w-fit mb-2"></View>
              {(startPrice !== "" || endPrice !== "") && (
                <TouchableOpacity
                  onPress={() => {
                    setStartPrice("");
                    setEndPrice("");
                  }}
                  className="ml-2 p-1 mb-2 bg-red-500 rounded-full"
                >
                  <Image
                    className="w-5 h-5"
                    resizeMode="contain"
                    source={require("@/assets/images/cancel.png")}
                  />
                </TouchableOpacity>
              )}
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                marginBottom: 10,
              }}
            >
              <>
                {/* Start Price Input */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 2,
                    height: 56,
                    borderColor: "#8e8e93",
                    borderRadius: 24,
                    paddingHorizontal: 15,
                    width: "40%",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Asap-Regular",
                      marginRight: 4,
                    }}
                  >
                    S$
                  </Text>
                  <TextInput
                    style={{
                      flex: 1,
                      fontFamily: "Asap-Regular",
                      fontSize: 16,
                    }}
                    placeholderTextColor="#8e8e93"
                    placeholder="From"
                    value={startPrice}
                    onChangeText={(text) => {
                      // Allow only digits and one comma or dot
                      let cleaned = text.replace(",", ".");

                      cleaned = cleaned.replace(/[^0-9.]/g, "");

                      // Prevent multiple commas
                      const parts = cleaned.split(".");
                      if (parts.length > 2) return;

                      // Limit to 2 digits after comma
                      if (parts[1]?.length > 2) return;

                      setStartPrice(cleaned);
                    }}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
                {/* Dash */}
                <View
                  style={{
                    width: "10%",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 28,
                      fontFamily: "Asap-Bold",
                    }}
                    className={`${
                      userDoc?.role == "tutor"
                        ? "text-primaryBlue"
                        : "text-primaryOrange"
                    }`}
                  >
                    -
                  </Text>
                </View>
                {/* End Price Input */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 2,
                    height: 56,
                    borderColor: "#8e8e93",
                    borderRadius: 24,
                    paddingHorizontal: 15,
                    width: "40%",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Asap-Regular",
                      marginRight: 4,
                    }}
                  >
                    S$
                  </Text>
                  <TextInput
                    style={{
                      flex: 1,
                      fontFamily: "Asap-Regular",
                      fontSize: 16,
                    }}
                    placeholderTextColor="#8e8e93"
                    placeholder="To"
                    value={endPrice}
                    onChangeText={(text) => {
                      // Allow only digits and one comma or dot
                      let cleaned = text.replace(",", ".");

                      cleaned = cleaned.replace(/[^0-9.]/g, "");

                      // Prevent multiple commas
                      const parts = cleaned.split(".");
                      if (parts.length > 2) return;

                      // Limit to 2 digits after comma
                      if (parts[1]?.length > 2) return;

                      setEndPrice(cleaned);
                    }}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
              </>
            </View>
            {/* Price Sorting */}
            <>
              <Text
                className={`pl-4 font-asap-medium ${
                  userDoc?.role == "tutor"
                    ? "text-darkPrimaryBlue"
                    : "text-darkPrimaryOrange"
                }`}
              >
                Sort Price by
              </Text>
              <View className="flex-row justify-between items-center w-full">
                <View className="flex-1">
                  <CustomDropDown
                    options={["Ascending", "Descending"]}
                    selected={filterPrice}
                    onSelect={(values) => {
                      if (typeof values === "string") {
                        setFilterPrice(values);
                      }
                    }}
                  />
                </View>
                {filterPrice !== "" && (
                  <TouchableOpacity
                    onPress={() => {
                      setFilterPrice("");
                    }}
                    className="ml-2 p-1 mb-2 bg-red-500 rounded-full"
                  >
                    <Image
                      className="w-5 h-5"
                      resizeMode="contain"
                      source={require("@/assets/images/cancel.png")}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </>
            {userDoc?.role == "tutee" && (
              // Filter by Ratings
              <>
                <Text
                  className={`pl-4 mt-5 font-asap-medium ${
                    userDoc?.role == "tutor"
                      ? "text-darkPrimaryBlue"
                      : "text-darkPrimaryOrange"
                  }`}
                >
                  Minimum Ratings (out of 5 stars)
                </Text>
                <View className="flex-row justify-between items-center w-full">
                  <View className="flex-1">
                    <CustomDropDown
                      options={["1", "2", "3", "4", "5"]}
                      selected={filterRating}
                      onSelect={(values) => {
                        if (typeof values === "string") {
                          setFilterRating(values);
                        }
                      }}
                    />
                  </View>
                  {filterRating !== "" && (
                    <TouchableOpacity
                      onPress={() => {
                        setFilterRating("");
                      }}
                      className="ml-2 p-1 mb-2 bg-red-500 rounded-full"
                    >
                      <Image
                        className="w-5 h-5"
                        resizeMode="contain"
                        source={require("@/assets/images/cancel.png")}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </ScrollView>
          <View className="flex-row justify-between">
            <View className="w-1/2 pr-4">
              <CustomButton
                title="Apply"
                onPress={handleApplyFilter}
                role={userDoc?.role}
                extraClassName="h-11"
                loading={loadingFilter}
                active={!loadingReset}
              />
            </View>
            <View className="w-1/2 pl-4">
              <CustomButton
                title="Reset"
                onPress={handleResetFilter}
                role={userDoc?.role}
                extraClassName="h-11"
                loading={loadingReset}
                active={!loadingFilter}
              />
            </View>
          </View>
        </View>
      </BottomSheetModal>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  input: {
    borderColor: "#8e8e93",
    borderWidth: 2,
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
    color: "#000",
    fontFamily: "Asap-Regular",
    marginBottom: 12,
  },
});
