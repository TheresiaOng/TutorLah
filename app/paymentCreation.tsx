import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import { router } from "expo-router";
import { addDoc, arrayUnion, collection, doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PaymentCreation() { // This component allows users to create a new payment record
  // State variables to hold payment details
  const [paidTo, setPaidTo] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [costPerHour, setCostPerHour] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { userDoc } = useAuth();

  async function handleSend() {
    if (
      !paidTo.trim() ||
      !paidBy.trim() ||
      !subject.trim() ||
      !date.trim() ||
      !startTime.trim() ||
      !endTime.trim() ||
      !costPerHour.trim() ||
      !totalCost.trim()
    ) {
      setErrorMsg("Please fill in all fields."); // Validate that all fields are filled
      return;
    }
    setErrorMsg('');
    const paymentRef = collection(db, "payments");

    try {
      const paymentDoc = await addDoc(paymentRef, { // Create a new payment document
        paidTo: userDoc.name,
        paidBy,
        subject,
        date,
        startTime,
        endTime,
        costPerHour,
        totalCost,
        isPaid: false,
      });

      const userDocRef = doc(db, "users", userDoc.userId); 
      await updateDoc(userDocRef, { 
      paymentIds: arrayUnion(paymentDoc.id) // Add the new payment ID to the user's paymentIds array
    });

      Alert.alert("Success", "Payment details saved.");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save payment details.");
      console.error("Error adding document: ", error);
    }
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Payment Details</Text>

      <LabelledInput label="Paid To:" value={paidTo} onChangeText={setPaidTo} />
      <LabelledInput label="Paid By:" value={paidBy} onChangeText={setPaidBy} />
      <LabelledInput label="Subject:" value={subject} onChangeText={setSubject} />
      <LabelledInput label="Date of Lesson:" value={date} onChangeText={setDate} />

      <Text style={styles.label}>Timing:</Text>
      <View style={styles.timingRow}>
        <TextInput
          style={styles.timingBox}
          placeholder="Start"
          value={startTime}
          onChangeText={setStartTime}
        />
        <Text style={styles.dash}>-</Text>
        <TextInput
          style={styles.timingBox}
          placeholder="End"
          value={endTime}
          onChangeText={setEndTime}
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
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
          {errorMsg}
        </Text>
      )}

      <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const LabelledInput = ({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} value={value} onChangeText={onChangeText} />
  </>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#2D6FA2',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 6,
    color: '#153A7D',
  },
  input: {
    backgroundColor: '#eee',
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timingBox: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
  },
  dash: {
    marginHorizontal: 10,
    fontSize: 18,
    color: '#2D6FA2',
  },
  sendButton: {
    marginTop: 65,
    backgroundColor: '#4DA8FF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  sendButtonText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#153A7D',
  },
});