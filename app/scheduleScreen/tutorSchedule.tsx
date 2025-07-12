import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/firebase";
import { router } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
};

export default function TutorSchedule() {
  const { userDoc } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const [loading, setLoading] = useState(false);

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
            const filtered = prevLessons.filter((l) => l.id !== id);
            if (data.isPaid) {
              return [
                ...filtered,
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
      const res = await fetch( // Create Stripe Connect account
        "https://ynikykgyystdyitckguc.functions.supabase.co/create-connect-account",
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

  if (showWebView && onboardingUrl) { // Show WebView for onboarding
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Image
            style={styles.backIcon}
            resizeMode="contain"
            source={require("../../assets/images/arrowBack.png")}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Schedules</Text>
        <TouchableOpacity
          onPress={startOnboarding}
          style={[
            styles.stripeButton,
            loading && { backgroundColor: "#999" }, // Disable button when loading
          ]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.stripeButtonText}>
              Stripe Account
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.lessonsContainer}>
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
              <TouchableOpacity
                onPress={() => router.push("/comingSoon")}
                style={styles.joinButton}
              >
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
    paddingVertical: 6,
    backgroundColor: "#59AEFF",
    borderRadius: 8,
  },
  stripeButtonText: {
    color: "white",
    fontWeight: "600",
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
