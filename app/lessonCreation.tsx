import CustomButton from "@/components/customButton";
import { useAuth } from "@/contexts/AuthProvider";
import { useChat } from "@/contexts/ChatProvider";
import { db } from "@/firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { router } from "expo-router";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LessonCreation() {
  // State variables to hold payment details
  const [paidTo, setPaidTo] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [subject, setSubject] = useState("");
  const [costPerHour, setCostPerHour] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [totalAfterTax, setTotalAfterTax] = useState("");

  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [showStartTime, setShowStartTime] = useState(false);
  const [endTime, setEndTime] = useState(new Date());
  const [showEndTime, setShowEndTime] = useState(false);

  // Supabase client
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
  const secret = Constants.expoConfig?.extra?.supabaseApiKey;

  const { userDoc } = useAuth();
  const { channel } = useChat();

  // Automatically fill paidTo and paidBy when userDoc or channel changes
  useEffect(() => {
    if (userDoc && channel) {
      const otherMember = Object.values(channel.state.members).find(
        (m) => m.user?.id !== userDoc.userId
      );

      setPaidTo(userDoc.name || "");
      setPaidBy(otherMember?.user?.name || "");
    }
  }, [userDoc, channel]);

  useEffect(() => {
    setErrorMsg("");
    if (costPerHour && startTime && endTime) {
      const startMillis = startTime.getTime();
      const endMillis = endTime.getTime();

      // Convert comma to dot for decimal parsing
      const cost = parseFloat(costPerHour.replace(",", "."));

      if (!isNaN(cost)) {
        const durationInHours = (endMillis - startMillis) / (1000 * 60 * 60);

        if (durationInHours >= 0.99) {
          setErrorMsg("");

          const total = (durationInHours * cost).toFixed(2).replace(".", ",");
          setTotalCost(total);

          const afterTax = (parseFloat(total.replace(",", ".")) - 2.7)
            .toFixed(2)
            .replace(".", ",");
          setTotalAfterTax(afterTax);
        } else if (durationInHours < 1 && durationInHours > 0) {
          setErrorMsg("Minimum class time must be 1 hour");
        } else {
          setTotalCost("");
          setTotalAfterTax("");
          setErrorMsg("End time must be later than start time");
          return;
        }
      } else {
        setTotalCost("");
        setTotalAfterTax("");
        setErrorMsg("");
      }
    } else {
      setTotalCost("");
      setTotalAfterTax("");
      setErrorMsg("");
    }
  }, [costPerHour, startTime, endTime]);

  function checkIfAllFieldsFilled() {
    return !!(
      paidTo.trim() &&
      paidBy.trim() &&
      subject.trim() &&
      date instanceof Date &&
      startTime instanceof Date &&
      endTime instanceof Date &&
      costPerHour.trim() &&
      totalCost.trim()
    );
  }

  async function handleSend() {
    if (!checkIfAllFieldsFilled()) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (parseFloat(costPerHour) < 3) {
      Alert.alert(
        "Minimum Cost/hr is S$3",
        "Stripe will impose a S$2.70 tax, please raise your class cost accordingly."
      );
      return;
    }

    setErrorMsg("");
    setSubmitting(true);

    const paymentRef = collection(db, "payments");

    try {
      const otherMember = channel
        ? Object.values(channel.state.members).find(
            (m) => m.user?.id !== userDoc?.userId //
            // Ensure we get the other member in the channel
          )
        : undefined;

      const otherUserId = otherMember?.user?.id;
      const otherUserName = otherMember?.user?.name;

      if (!otherUserId) {
        setErrorMsg("Could not determine the other user.");
        return;
      }

      const paymentDoc = await addDoc(paymentRef, {
        paidTo: userDoc.name,
        paidBy: otherUserName,
        tutorId: userDoc.userId,
        tuteeId: otherUserId,
        subject,
        date: date.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        costPerHour,
        totalCost,
        isPaid: true,
      });

      const userDocRef = doc(db, "users", userDoc.userId); // Reference to the user's document
      await updateDoc(userDocRef, {
        paymentIds: arrayUnion(paymentDoc.id), // Add the payment ID to the user's document
      });

      const otherUserDocRef = doc(db, "users", otherUserId); // Reference to the other user's document
      await updateDoc(otherUserDocRef, {
        paymentIds: arrayUnion(paymentDoc.id), // Add the payment ID to the other user's document
      });

      const { data, error } = await supabase // Fetch the Stripe account ID for the user
      .from("users")
      .select("stripe_account_id")
      .eq("tutorId", userDoc.userId)
      .single();  

      const stripeAccountId = data?.stripe_account_id;

      if (!stripeAccountId) {
        setErrorMsg("Stripe account not found. Please create a Stripe account in the Schedule Screen.");
        setSubmitting(false);
        return;
      }

      const checkoutRes = await fetch( // Create a PayNow checkout session
        "https://ynikykgyystdyitckguc.supabase.co/functions/v1/create-checkout-session",
        {
          method: "POST",
          headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${secret}`, // Use the secret key for authentication
                },
          body: JSON.stringify({
            amount: parseFloat(totalCost),
            stripeAccountId,
            description: `Lesson: ${subject} on ${date}`,
          }),
        }
      );

      const checkoutData = await checkoutRes.json(); 
      console.log("Checkout Data:", checkoutData);

    if (!checkoutRes.ok || !checkoutData?.url) {
      setErrorMsg("Failed to generate PayNow link.");
      setSubmitting(false);
      return;
    }

    const paynowUrl = checkoutData.url; // Extract the PayNow URL from the response

    // Send message to the channel with payment details
      await channel?.sendMessage({
        text: `New class created by **${
          userDoc.name
        }** for **${otherUserName}**:
          \nSubject: ${subject}
          \nDate: ${date.toDateString()}
          \nTime: ${startTime.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })} - ${endTime.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
          \nCost/hr: S$${costPerHour}
          \nTotal cost: S$${totalCost}
          \n\n 👉 [Click here to pay via PayNow](${paynowUrl})`, 
        user_id: userDoc.userId,
      });

      Alert.alert("Success", "Lesson created.");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to create lesson.");
      console.error("Error adding document: ", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="flex-1 bg-white justify-center items-center">
      <View className="border-primaryBlue bg-primaryBlue border-8 w-full justify-center items-center h-1/6">
        <View className="flex-row w-11/12 items-center inset-y-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="items-center h-full justify-center mr-2"
          >
            <Image
              className="w-10"
              resizeMode="contain"
              source={require("../assets/images/cancel.png")}
            />
          </TouchableOpacity>
          <Text
            className={`${
              userDoc?.role === "tutor" ? "text-white" : "text-darkBrown"
            } font-asap-bold text-3xl`}
          >
            Create Lesson
          </Text>
        </View>
      </View>
      <KeyboardAvoidingView
        className="flex-1 w-full"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="h-5/6 w-full my-4 mt-6 px-6">
          <LabelledInput
            label="Paid To"
            value={paidTo}
            onChangeText={setPaidTo}
            editable={false} // Make this field non-editable
            // since it should be filled automatically
          />
          <LabelledInput
            label="Paid By"
            value={paidBy}
            onChangeText={setPaidBy}
            editable={false} // Make this field non-editable
            // since it should be filled automatically
          />
          <LabelledInput
            label="Subject"
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.label}>Date</Text>

          {!showDate ? (
            <TouchableOpacity
              onPress={() => {
                setShowDate(true);
                setShowStartTime(false);
                setShowEndTime(false);
              }}
            >
              <Text style={styles.input}>
                {date ? date.toLocaleDateString() : "Select Date"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-col">
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || date;
                  setDate(currentDate);
                }}
                textColor="black"
                minimumDate={new Date()}
              />
              <CustomButton
                title="Confirm Date"
                role="tutor"
                onPress={() => setShowDate(false)}
              />
            </View>
          )}

          <View className="flex-col space-y-4">
            <Text style={styles.label}>Start Time</Text>
            {/* START TIME */}

            {!showStartTime ? (
              <TouchableOpacity
                onPress={() => {
                  setShowDate(false);
                  setShowStartTime(true);
                  setShowEndTime(false);
                }}
              >
                <Text style={styles.input}>
                  {startTime
                    ? startTime.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : "Select Start Time"}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-1">
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedTime) => {
                    const currentTime = selectedTime || startTime;
                    setStartTime(currentTime);
                  }}
                  textColor="black"
                />
                <CustomButton
                  title="Confirm Start Time"
                  role="tutor"
                  onPress={() => setShowStartTime(false)}
                />
              </View>
            )}
          </View>

          <Text style={styles.label}>End Time</Text>
          {/* END TIME */}

          {!showEndTime ? (
            <TouchableOpacity
              onPress={() => {
                setShowDate(false);
                setShowStartTime(false);
                setShowEndTime(true);
              }}
            >
              <Text style={styles.input}>
                {endTime
                  ? endTime.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : "Select End Time"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-1">
              <DateTimePicker
                value={endTime}
                mode="time"
                display="spinner"
                onChange={(event, selectedTime) => {
                  const currentTime = selectedTime || endTime;
                  setEndTime(currentTime);
                }}
                textColor="black"
              />
              <CustomButton
                title="Confirm End Time"
                role="tutor"
                onPress={() => setShowEndTime(false)}
              />
            </View>
          )}

          <Text style={styles.label}>Cost/hr</Text>
          <View className="flex-row items-center h-14 border-gray border-2 rounded-3xl mb-4 p-2 w-full">
            <Text className="text-lg font-asap-regular ml-1 mr-1">S$</Text>
            <TextInput
              className={`font-asap-regular flex-1`}
              keyboardType="numeric"
              value={costPerHour}
              onChangeText={(text) => {
                // Allow only digits and one comma
                let cleaned = text.replace(/[^0-9,]/g, "");

                // Prevent multiple commas
                const parts = cleaned.split(",");
                if (parts.length > 2) return;

                // Limit to 2 digits after comma
                if (parts[1]?.length > 2) return;

                setCostPerHour(cleaned);
              }}
            />
          </View>

          <Text style={styles.label}>Total cost</Text>
          <View className="flex-row items-center h-14 bg-lightGray rounded-3xl border-gray border-2 mb-2 p-2 w-full">
            <Text className="text-lg font-asap-regular ml-1 mr-1">S$</Text>
            <TextInput
              className={`font-asap-regular flex-1`}
              keyboardType="numeric"
              value={totalCost}
              onChangeText={setTotalCost}
              editable={false} // Make this field non-editable
              // since it should be calculated automatically
            />
          </View>
          {totalAfterTax && (
            <Text className="text-sm font-asap-regular ml-1 mb-12 mr-1">
              ❗️After Stripe tax (S$2.70) you will receive: S${totalAfterTax}
            </Text>
          )}

          {errorMsg !== "" && (
            <Text
              style={{
                color: "red",
                textAlign: "center",
                marginTop: 20,
                fontFamily: "Asap",
              }}
            >
              {errorMsg}
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <View className="w-full mb-12 px-6">
        <CustomButton
          title="Send"
          role="tutor"
          onPress={handleSend}
          active={errorMsg === "" && !submitting && checkIfAllFieldsFilled()}
          loading={submitting}
        />
      </View>
    </View>
  );
}

const LabelledInput = ({
  label,
  value,
  onChangeText,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
}) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={editable ? styles.input : styles.disabledInput}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
    />
  </>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#14317A",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 6,
    color: "#1A4F82",
    fontFamily: "Asap-Regular",
  },
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
  disabledInput: {
    backgroundColor: "#ebebeb",
    borderColor: "#8e8e93",
    borderWidth: 2,
    borderRadius: 20,
    padding: 14,
    fontSize: 16,
    color: "#000",
    fontFamily: "Asap-Regular",
    marginBottom: 12,
  },
  sendButton: {
    marginTop: 20,
    backgroundColor: "#59AEFF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
    marginBottom: 50,
  },
  sendButtonText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#1A4F82",
    fontFamily: "Asap-Bold",
  },
  disabledSendButton: {
    backgroundColor: "#ebebeb",
  },
  disabledSendButtonText: {
    color: "#5d5d5d",
  },
});
