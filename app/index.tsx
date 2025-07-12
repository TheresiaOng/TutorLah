import { useAuth } from "@/contexts/AuthProvider";
import { useChat } from "@/contexts/ChatProvider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const { userDoc } = useAuth();
  const router = useRouter();
  const [showOverlay, setShowOverlay] = useState(false);

  let isChatReady = false;

  try {
    const { isChatReady: ready } = useChat();
    isChatReady = ready;
  } catch (e) {
    // not in ChatProvider yet — ignore
    isChatReady = false;
  }

  useEffect(() => {
    if (userDoc && isChatReady) {
      setShowOverlay(true);
      router.replace("/homeScreen/home");
    }
  }, [userDoc, isChatReady]);

  return (
    <View className="flex-1 h-fullitems-center">
      <Image
        source={require("../assets/images/bgLandingPage.png")}
        className="absolute top-0 left-0 w-full h-full"
        resizeMode="cover"
      />
      <View className="size-1/12" />
      <View className="w-full justify-center items-center size-2/12">
        <Text
          className="text-6xl font-luckiest-guy color-primaryOrange font-bold"
          style={{
            textShadowColor: "rgba(0, 0, 0, 0.6)",
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 1.2,
          }}
        >
          TutorLah!
        </Text>
        <Text className="font-asap-bold text-darkPrimaryBlue">
          Where Tutors and Students Click
        </Text>
      </View>
      <View className="justify-center w-full items-center size-2/6 mt-6">
        <Image
          source={require("../assets/images/TutorLahLogo.png")}
          className="w-64"
          resizeMode="contain"
        />
      </View>
      <View className="size-4/12 items-center w-full justify-center">
        {/* Navigation buttons for login and signup */
        /* These buttons will navigate to the respective screens when pressed */}
        <TouchableOpacity
          className="bg-secondaryOrange w-80 items-center p-4 rounded-2xl mt-4"
          onPress={() => router.push("/loginScreen/signup")}
        >
          <Text className="font-asap-bold text-darkBrown">Sign Up</Text>
        </TouchableOpacity>
        <View className="flex-row gap-1">
          <Text className="font-asap-semibold text-white mt-2">
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push("/loginScreen/login")}>
            <Text className="font-asap-semibold text-darkBrown mt-2">
              Log In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {showOverlay && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text className="text-white mt-4 font-asap-medium">
            Redirecting...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)", // dark transparent
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
