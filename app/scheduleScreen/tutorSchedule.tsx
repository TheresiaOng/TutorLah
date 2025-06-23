import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import { router } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
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
  isPaid?: boolean;
};

export default function TutorSchedule() {
  const { userDoc } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]); // State to hold the lessons

  useEffect(() => {
    if (!userDoc?.userId) return;

    const userRef = doc(db, "users", userDoc.userId);

    // Listen to changes in the user's document to get paymentIds
    const unsubscribe = onSnapshot(userRef, (userSnap) => {
      const userData = userSnap.data();
      const ids = userData?.paymentIds || [];
      // Clear old payment listeners
      const unsubscribers: (() => void)[] = [];
      // Listen to each payment document
      ids.forEach((id: string) => {
        const paymentRef = doc(db, "payments", id); 

        const unsubscribePayment = onSnapshot(paymentRef, (paymentSnap) => { // Listen to changes in each payment document
          if (!paymentSnap.exists()) return; 

          const data = paymentSnap.data(); // Get the payment data
          if (!data) return;

          setLessons((prevLessons) => {
            const filtered = prevLessons.filter((l) => l.id !== id); // Remove old lesson if it exists
            // Only add if the payment is marked as paid
            if (data.isPaid) {
              return [
                ...filtered, // Add the new lesson
                {
                  id,
                  paidBy: data.paidBy,
                  subject: data.subject,
                  date: data.date,
                  startTime: data.startTime,
                  endTime: data.endTime,
                },
              ];
            }
            return filtered; // Remove if not paid
          });
        });
        unsubscribers.push(unsubscribePayment); 
      });

      return () => {
        unsubscribers.forEach((unsub) => unsub());
      };
    });

    return () => unsubscribe();
  }, [userDoc]);

  return (
    <View className="flex-1 bg-white w-full">
      {/* Header */}
      <View className="border-8 w-full justify-center items-center h-1/6 border-primaryBlue bg-primaryBlue">
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
          <Text className="font-asap-bold text-3xl text-white">Schedules</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} className="w-full">
        {lessons.length === 0 ? (
          <Text style={styles.noLessonsText}>No meetings scheduled.</Text>
        ) : (
          lessons.map((lesson) => (
            <View style={styles.card} key={lesson.id}>
              <Text style={styles.name}>{lesson.paidBy}</Text>
              <View style={styles.divider} />

              <View style={styles.detail}>
                <Text style={styles.label}>Subject:</Text>
                <Text style={styles.value}>{lesson.subject}</Text>
              </View>

              <View style={styles.detail}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{lesson.date}</Text>
              </View>

              <View style={styles.detail}>
                <Text style={styles.label}>Timing:</Text>
                <Text style={styles.value}>
                  {lesson.startTime} - {lesson.endTime}
                </Text>
              </View>

              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinText}>Join Class</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  noLessonsText: {
    textAlign: "center",
    fontSize: 18,
    color: "#999",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#D8ECFF",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    marginBottom: 30,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontFamily: "Asap-Bold",
    color: "#1A4F82",
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: "#59AEFF",
    marginVertical: 10,
  },
  detail: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontFamily: "Asap-Semibold",
    color: "#1A4F82",
    marginRight: 20,
    width: 90,
  },
  value: {
    fontSize: 15,
    fontFamily: "Asap-Regular",
    color: "#1A4F82",
  },
  joinButton: {
    marginTop: 20,
    backgroundColor: "#59AEFF",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  joinText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#1A4F82",
  },
});
