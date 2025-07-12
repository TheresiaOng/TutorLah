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
  paidTo: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  isPaid?: boolean;
  tutorId: string; // Added tutorID to track the tutor
};

export default function ScheduleHistory() {
  const { userDoc } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]); // State to hold the lessons
  const [reviewedIds, setReviewedIds] = useState<string[]>([]); // State to hold reviewed payment IDs

  useEffect(() => {
    if (!userDoc?.userId) return;

    const userRef = doc(db, "users", userDoc.userId);

    const unsubReviewed = onSnapshot(userRef, (snapshot) => {
      const data = snapshot.data();
      setReviewedIds(data?.reviewedPaymentIds || []);
    });

    // Get lesson/payment data
    const unsubUser = onSnapshot(userRef, (snapshot) => {
      const userData = snapshot.data();
      const ids = userData?.paymentIds || [];
      const unsubscribers: (() => void)[] = [];
      ids.forEach((id: string) => {
        // Listen to each payment document
        const paymentRef = doc(db, "payments", id);
        const unsub = onSnapshot(paymentRef, (snap) => {
          const data = snap.data();

          if (snap.exists() && data?.isPaid) {
            // Only add if the payment is marked as paid
            setLessons((prev) => {
              const filtered = prev.filter((l) => l.id !== id); // Remove old lesson if it exists

              const now = new Date();
              const end = new Date(data.endTime);

              const hasEnded = end < now;

              if (hasEnded) {
                return [
                  ...filtered,
                  {
                    id,
                    paidBy: data.paidBy,
                    paidTo: data.paidTo,
                    subject: data.subject,
                    date: data.date,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    tutorId: data.tutorId,
                  },
                ];
              }
              return filtered; // remove if not ended yet
            });
          }
        });
        unsubscribers.push(unsub);
      });
      return () => unsubscribers.forEach((u) => u());
    });
    return () => {
      unsubReviewed();
      unsubUser();
    };
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
              className="items-center h-full justify-center mt-1 mr-2"
            >
              <Image
                className="w-10"
                resizeMode="contain"
                style={{ marginTop: 11 }}
                source={require("../../assets/images/arrowBack.png")}
              />
            </TouchableOpacity>
            <Text className="font-asap-bold text-3xl text-darkBrown">
              History
            </Text>
          </View>
        </View>
      </View>

      {/* Main Scroll Content */}
      <ScrollView contentContainerStyle={styles.container} className="w-full">
        {lessons.length === 0 ? (
          <Text style={styles.noLessonsText}>No lesson history</Text>
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
                <Text style={styles.value}>
                  {new Date(lesson.date).toDateString()}
                </Text>
              </View>

              <View style={styles.detail}>
                <Text style={styles.label}>Timing:</Text>
                <Text style={styles.value}>
                  {new Date(lesson.startTime).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(lesson.endTime).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              {reviewedIds.includes(lesson.id) ? ( // Check if the lesson has been reviewed and if then button changes
                <View
                  style={[
                    styles.leaveReviewButton,
                    { backgroundColor: "#ccc" },
                  ]}
                >
                  <Text style={[styles.leaveReviewText, { color: "#888" }]}>
                    Review Submitted
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.leaveReviewButton}
                  onPress={() =>
                    router.push({
                      pathname: "/createReview", // Navigate to create review screen
                      params: {
                        paidTo: lesson.paidTo,
                        paidBy: lesson.paidBy,
                        tutorId: lesson.tutorId,
                        paymentId: lesson.id,
                      },
                    })
                  }
                >
                  <Text style={styles.leaveReviewText}>Leave Review</Text>
                </TouchableOpacity>
              )}
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
    fontFamily: "Asap-Regualr",
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
    fontFamily: "Asap-Bold",
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
  leaveReviewButton: {
    marginTop: 20,
    backgroundColor: "#FFD256",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  leaveReviewText: {
    fontFamily: "Asap-Bold",
    fontSize: 18,
    color: "#8B402E",
  },
});
