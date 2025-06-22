import { useAuth } from "@/contexts/AuthProvider";
import { useChat } from "@/contexts/ChatProvider";
import { db } from "@/firebase";
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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PaymentCreation() {
  // State variables to hold payment details
  const [paidTo, setPaidTo] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [costPerHour, setCostPerHour] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  function checkIfAllFieldsFilled() {
    return !!(
      paidTo.trim() &&
      paidBy.trim() &&
      subject.trim() &&
      date.trim() &&
      startTime.trim() &&
      endTime.trim() &&
      costPerHour.trim() &&
      totalCost.trim()
    );
  }

  async function handleSend() {
    if (!checkIfAllFieldsFilled()) {
      setErrorMsg("Please fill in all fields.");
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
        subject,
        date,
        startTime,
        endTime,
        costPerHour,
        totalCost,
        isPaid: false,
      });

      const userDocRef = doc(db, "users", userDoc.userId); // Reference to the user's document
      await updateDoc(userDocRef, { 
        paymentIds: arrayUnion(paymentDoc.id), // Add the payment ID to the user's document
      });

      const otherUserDocRef = doc(db, "users", otherUserId); // Reference to the other user's document
      await updateDoc(otherUserDocRef, {
        paymentIds: arrayUnion(paymentDoc.id), // Add the payment ID to the other user's document
      });

      Alert.alert("Success", "Payment details saved.");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save payment details.");
      console.error("Error adding document: ", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Payment Details</Text>

      <LabelledInput
        label="Paid To:"
        value={paidTo}
        onChangeText={setPaidTo}
        editable={false} // Make this field non-editable
        // since it should be filled automatically
      />
      <LabelledInput
        label="Paid By:"
        value={paidBy}
        onChangeText={setPaidBy}
        editable={false} // Make this field non-editable
        // since it should be filled automatically
      />
      <LabelledInput label="Subject:" value={subject} onChangeText={setSubject} />
      <LabelledInput label="Date of Lesson:" value={date} onChangeText={setDate} />

      <Text style={styles.label}>Timing:</Text>
      <View style={styles.timingRow}>
        <TextInput
          style={styles.timingBox}
          placeholder="Start"
          value={startTime}
          onChangeText={setStartTime}
          keyboardType="numbers-and-punctuation"
        />
        <Text style={styles.dash}>-</Text>
        <TextInput
          style={styles.timingBox}
          placeholder="End"
          value={endTime}
          onChangeText={setEndTime}
          keyboardType="numbers-and-punctuation"
        />
      </View>

      <Text style={styles.label}>Cost/hr:</Text>
      <TextInput
        style={styles.input}
        placeholder="S$"
        placeholderTextColor="#0077aa"
        keyboardType="numeric"
        value={costPerHour}
        onChangeText={setCostPerHour}
      />

      <Text style={styles.label}>Total cost:</Text>
      <TextInput
        style={styles.input}
        placeholder="S$"
        placeholderTextColor="#0077aa"
        keyboardType="numeric"
        value={totalCost}
        onChangeText={setTotalCost}
      />

      {errorMsg !== "" && (
        <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>
          {errorMsg}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.sendButton,
          (submitting || !checkIfAllFieldsFilled()) && styles.disabledSendButton, // Disable button if submitting or fields are not filled
        ]}
        onPress={handleSend}
        disabled={submitting || !checkIfAllFieldsFilled()}
      >
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
    </ScrollView>
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
      style={styles.input}
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
    color: "#14317A", 
  },
  input: {
    backgroundColor: "#eee",  
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
    color: "#000",
  },
  timingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  timingBox: {
    flex: 1,
    backgroundColor: "#eee", 
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
    color: "#000",
  },
  dash: {
    marginHorizontal: 10,
    fontSize: 18,
    color: "#14317A", 
  },
  sendButton: {
    marginTop: 65,
    backgroundColor: "#2C69A2", 
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  sendButtonText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#14317A", 
  },
  disabledSendButton: {
    backgroundColor: "#aaccee",
  },
});
