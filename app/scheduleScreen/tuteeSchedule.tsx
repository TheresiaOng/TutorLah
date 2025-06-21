import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import { router } from "expo-router";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
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
  paidTo: string;
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
    if (!userDoc?.userId) return; // Ensure userDoc is available

    const userRef = doc(db, "users", userDoc.userId); // Reference to the user document

    const unsubscribe = onSnapshot(userRef, async (snapshot) => {
      const userData = snapshot.data();
      const ids = userData?.paymentIds || [];

      const paymentPromises = ids.map(async (id: string) => {
        const paymentDoc = await getDoc(doc(db, "payments", id)); // Reference to the payment document
        if (!paymentDoc.exists()) return null; // Check if the payment document exists

        const paymentData = paymentDoc.data() as Lesson | undefined;
        console.log("paymentData", paymentData); // Log the payment data

        if (paymentData?.isPaid) {
          return {
            id: paymentDoc.id,
            paidBy: paymentData.paidBy,
            paidTo: paymentData.paidTo,
            subject: paymentData.subject,
            date: paymentData.date,
            startTime: paymentData.startTime,
            endTime: paymentData.endTime,
          };
        }
        return null;
      });

      const results = await Promise.all(paymentPromises); 
      setLessons(results.filter(Boolean) as Lesson[]);
    });

    return () => unsubscribe();
  }, [userDoc]);

  return (
    <View className="flex-1 bg-white w-full">
      {/* Header */}
      <View className="border-8 w-full justify-center items-center h-1/6 border-primaryOrange bg-primaryOrange">
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
              <Text style={styles.name}>{lesson.paidTo}</Text>
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
    backgroundColor: "#FFEFC3",  
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
    fontWeight: "bold",
    color: "#8B402E", 
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFAF2F", 
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
    fontWeight: "bold",
    color: "#8B402E",
    marginRight: 20,
    width: 90,
  },
  value: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#8B402E", 
  },
  joinButton: {
    marginTop: 20,
    backgroundColor: "#FFD256",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  joinText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#8B402E", 
  },
});
