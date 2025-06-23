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
  tutorID: string;
};

export default function TuteeSchedule() {
  const { userDoc } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    if (!userDoc?.userId) return;

    const userRef = doc(db, "users", userDoc.userId);

    const unsubscribe = onSnapshot(userRef, async (snapshot) => {
      const userData = snapshot.data();
      const ids = userData?.paymentIds || [];

      const paymentPromises = ids.map(async (id: string) => {
        const paymentDoc = await getDoc(doc(db, "payments", id));
        if (!paymentDoc.exists()) return null;

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
            tutorID: paymentData.tutorID,
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
        <View className="flex-row w-11/12 items-center justify-between inset-y-6">
          {/* Back Button + Title */}
          <View className="flex-row items-center">
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

          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: "/scheduleScreen/scheduleHistory" })
            }
            className="px-3 py-2 rounded bg-secondaryOrange"
          >
            <Text className="text-red-600 font-asap-bold text-xl">History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scroll Content */}
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
    fontFamily: "Asap-Regular",
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
    fontFamily: "Asap-Bold",
    color: "#8B402E",
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFD256",
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
    color: "#8B402E",
    marginRight: 20,
    width: 90,
  },
  value: {
    fontSize: 15,
    fontFamily: "Asap-Regular",
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
    fontFamily: "Asap-Bold",
    fontSize: 18,
    color: "#8B402E",
  },
});
