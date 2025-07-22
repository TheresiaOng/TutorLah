import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import { router } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

type Lesson = {
  id: string;
  paidBy: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  isPaid?: boolean;
  tutorId: string;
  tuteeId: string;
};

export default function TutorSchedule() {
  const { userDoc } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Firestore: Fetch lessons
  useEffect(() => {
    if (!userDoc?.userId) return;

    const userRef = doc(db, "users", userDoc.userId);

    const unsubscribe = onSnapshot(userRef, (userSnap) => {
      const userData = userSnap.data();
      const ids = userData?.paymentIds || [];
      const unsubscribers: (() => void)[] = [];

      ids.forEach((id: string) => {
        const paymentRef = doc(db, "payments", id);
        const unsubscribePayment = onSnapshot(paymentRef, (paymentSnap) => {
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
                ...filtered,
                {
                  id,
                  paidBy: data.paidBy,
                  subject: data.subject,
                  date: data.date,
                  startTime: data.startTime,
                  endTime: data.endTime,
                  tutorId: data.tutorId,
                  tuteeId: data.tuteeId,
                },
              ];
            }
            return filtered;
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

  // Start onboarding
  async function startOnboarding() {
    if (!userDoc?.userId) {
      Alert.alert("Error", "User not logged in");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        // Create Stripe Connect account
        "https://ynikykgyystdyitckguc.supabase.co/functions/v1/create-connect-account",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userDoc.userId }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Onboarding fetch failed:", res.status, errorText);
        throw new Error("Failed to get onboarding URL");
      }

      const data = await res.json();

      if (!data.onboardingUrl) throw new Error("No onboarding URL returned");

      setOnboardingUrl(data.onboardingUrl); // Set the onboarding URL
      setShowWebView(true);
    } catch (err) {
      console.error("Onboarding error:", err);
      Alert.alert("Error", "Could not start onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  // WebView redirect detection
  function onNavigationStateChange(navState: { url: string }) {
    const { url } = navState;

    if (url.startsWith("tutorlah://onboarding-complete")) {
      setShowWebView(false);
      Alert.alert("Onboarding Complete!", "You can receive payment now.");
    } else if (url.startsWith("tutorlah://onboarding-refresh")) {
      startOnboarding();
    }
  }

  if (showWebView && onboardingUrl) {
    // Show WebView for onboarding
    return (
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: onboardingUrl }}
          onNavigationStateChange={onNavigationStateChange}
          startInLoadingState
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View className="border-8 w-full justify-center items-center h-1/6 border-primaryBlue bg-primaryBlue">
        <View className="flex-row w-11/12 items-center justify-between inset-y-6">
          <Text className="font-asap-bold text-3xl text-white">
            Your Schedules
          </Text>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Stripe Account",
                  "This will prompt you to edit your stripe account and you must complete it fully before creating further classes. Do you wish to continue?",
                  [{text: "Cancel", style: "cancel",},{text: "Ok", onPress: startOnboarding,},]
                );
              }}
              style={[
                styles.stripeButton,
                loading && { backgroundColor: "#999" },
              ]}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.stripeButtonText}>Stripe Account</Text>
              )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.lessonsContainer}>
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
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A4F82",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: "#fff",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  stripeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#59AEFF",
    borderRadius: 8,
  },
  stripeButtonText: {
    color: "white",
    fontWeight: "600",
    fontFamily: "Asap",
  },
  lessonsContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  noLessonsText: {
    fontSize: 18,
    color: "#999",
    marginTop: 40,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#D8ECFF",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
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
  },
  label: {
    fontSize: 16,
    color: "#1A4F82",
    marginRight: 20,
    width: 90,
    fontWeight: "600",
  },
  value: {
    fontSize: 15,
    color: "#1A4F82",
  },
  joinButton: {
    marginTop: 20,
    backgroundColor: "#59AEFF",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  joinText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#1A4F82",
  },
});
