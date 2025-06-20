import { useAuth } from "@/contexts/authContext";
import { db } from "@/firebase";
import {
    doc,
    getDoc,
    onSnapshot
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Lesson = {
  id: string;
  paidBy: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
};

export default function TutorScheduleScreen() { 
  const { userDoc } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    if (!userDoc?.userId) return; // Ensure userDoc is available before proceeding

    const userRef = doc(db, "users", userDoc.userId); 

    const unsubscribe = onSnapshot(userRef, async (snapshot) => { //
      const userData = snapshot.data(); 
      const ids = userData?.paymentIds || []; 

      interface PaymentData { 
        isPaid: boolean;
        paidBy: string;
        subject: string;
        date: string;
        startTime: string;
        endTime: string;
      }

      const paymentPromises = ids.map(async (id: string) => {  
        const paymentDoc = await getDoc(doc(db, "payments", id)); 
        if (!paymentDoc.exists()) return null; // If the payment document does not exist, return null
        // Extract payment data and check if it is paid
        const paymentData = paymentDoc.data() as PaymentData | undefined; 

        if (paymentData?.isPaid) { // If the payment is marked as paid, return the lesson details
          return {
            id: paymentDoc.id,
            paidBy: paymentData.paidBy,
            subject: paymentData.subject,
            date: paymentData.date,
            startTime: paymentData.startTime,
            endTime: paymentData.endTime,
          };
        } else {
          return null;
        }
      });

      const results = await Promise.all(paymentPromises); // Wait for all payment documents to be fetched and processed
      // Filter out any null values from the results
      setLessons(results.filter(Boolean) as Lesson[]);
    });

    return () => unsubscribe();
  }, [userDoc]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Schedule</Text>

      {lessons.length === 0 ? (
        <Text style={styles.noLessonsText}>No meetings scheduled.</Text>
      ) : (
        lessons.map((lesson) => (
          <View style={styles.card} key={lesson.id}>
            <Text style={styles.name}>{lesson.paidBy}</Text>
            <View style={styles.divider} />

            <View style={styles.Row}>
              <Text style={styles.label}>Subjects</Text>
              <Text style={styles.value}>: {lesson.subject}</Text>
            </View>

            <View style={styles.Row}>
              <Text style={styles.label}>Timing</Text>
              <Text style={styles.value}>: {lesson.startTime} – {lesson.endTime}</Text>
            </View>

            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinText}>Join Class</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: "center", 
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#2D6FA2",
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 5,
    marginBottom: 30,
  },
  noLessonsText: {
    textAlign: "center",
    fontSize: 18,
    color: "#999",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#EAF3FB", 
    borderRadius: 15,
    padding: 20,
    width: "85%",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#153A7D",
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: "#153A7D", //
    marginVertical: 10,
  },
  Row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#153A7D", 
  },
  value: {
    fontSize: 16,
    color: "#153A7D", 
  },
  joinButton: {
    marginTop: 20,
    backgroundColor: "#4DA8FF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  joinText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#fff",
  },
});
