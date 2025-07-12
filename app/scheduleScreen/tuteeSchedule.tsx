import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import { router } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
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
  paidTo: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  isPaid?: boolean;
  tutorId: string;
  tuteeId: string;
};

export default function TuteeSchedule() {
  const { userDoc } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const handleJoinCall = (
    lessonId: string,
    tutorId: string,
    tuteeId: string
  ) => {
    router.push({
      pathname: "/videoScreen/[callId]",
      params: { callId: lessonId, tutorId: tutorId, tuteeId: tuteeId },
    });
  };

  useEffect(() => {
    if (!userDoc?.userId) return;

    const userRef = doc(db, "users", userDoc.userId);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const userData = snapshot.data();
      const ids = userData?.paymentIds || [];

      const unsubscribers: (() => void)[] = []; // Clear old payment listeners
      ids.forEach((id: string) => {
        // Listen to each payment document
        const paymentRef = doc(db, "payments", id);
        const unsubscribePayment = onSnapshot(paymentRef, (paymentSnap) => {
          // Listen to changes in each payment document
          if (!paymentSnap.exists()) return;

          const data = paymentSnap.data();
          if (!data) return;
          setLessons((prevLessons) => {
            const filtered = prevLessons.filter((l) => l.id !== id); // Remove old lesson if it exists
            // Only add if the payment is marked as paid and not ended yet

            const now = new Date();
            const end = new Date(data.endTime);

            const hasEnded = end < now;

            if (data.isPaid && !hasEnded) {
              return [
                ...filtered, // Add the new lesson
                {
                  id,
                  paidBy: data.paidBy,
                  paidTo: data.paidTo,
                  subject: data.subject,
                  date: data.date,
                  startTime: data.startTime,
                  endTime: data.endTime,
                  tutorId: data.tutorId,
                  tuteeId: data.tuteeId,
                },
              ];
            }
            return filtered; // Remove if unpaid
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
      <View className="border-8 w-full justify-center items-center h-1/6 border-primaryOrange bg-primaryOrange">
        <View className="flex-row w-11/12 items-center justify-between inset-y-6">
          <Text className="font-asap-bold text-3xl text-white">
            Your Schedules
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: "/scheduleScreen/scheduleHistory" })
            }
            className="px-3 py-2 rounded bg-secondaryOrange"
          >
            <Text className="text-darkBrown font-asap-bold text-xl">
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.container} className="w-full">
        {lessons.length === 0 ? (
          <Text style={styles.noLessonsText}>No lessons scheduled</Text>
        ) : (
          lessons.map((lesson) => {
            const now = new Date();

            const lessonDate = new Date(lesson.date);
            const start = new Date(lesson.startTime);
            const end = new Date(lesson.endTime);

            const onGoing =
              now >= start &&
              now <= end &&
              lessonDate.toDateString() === now.toDateString();

            return (
              <View style={styles.card} key={lesson.id}>
                <Text style={styles.name}>{lesson.paidBy}</Text>
                <View style={styles.divider} />

                <View style={styles.detail}>
                  <Text style={styles.label}>Subject:</Text>
                  <Text style={styles.value}>{lesson.subject}</Text>
                </View>

                <View style={styles.detail}>
                  <Text style={styles.label}>Date:</Text>
                  <Text style={styles.value}>{lessonDate.toDateString()}</Text>
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

                {/* Only show join button if the class is ongoing */}
                {onGoing && (
                  <TouchableOpacity
                    onPress={() =>
                      handleJoinCall(lesson.id, lesson.tutorId, lesson.tuteeId)
                    }
                    style={styles.joinButton}
                  >
                    <Text style={styles.joinText}>Join Class</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
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
