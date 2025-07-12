import { useAuth } from "@/contexts/AuthProvider";
import {
  Call,
  CallContent,
  CallingState,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import Constants from "expo-constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OverlayProvider } from "stream-chat-expo";

const CallScreen = () => {
  const { callId, tutorId, tuteeId } = useLocalSearchParams<{
    callId?: string;
    tutorId?: string;
    tuteeId?: string;
  }>();
  const [call, setCall] = useState<Call | null>(null);
  const { userDoc } = useAuth();

  const handleHangup = () => {
    call?.leave();
    client?.disconnectUser();
    console.log("User left the call. User disconnected.");

    if (userDoc?.role === "tutor") {
      router.push("/scheduleScreen/tutorSchedule");
    } else {
      router.push("/scheduleScreen/tuteeSchedule");
    }
  };

  if (!callId) {
    return (
      <SafeAreaView>
        <View className="items-center flex-col justify-center w-full h-full">
          <Text className="font-asap-medium mt-4">
            Error. CallId is missing.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const [client, setClient] = useState<StreamVideoClient | null>(null);

  useEffect(() => {
    const initializeClient = async () => {
      if (!userDoc?.userId) return;

      // function to ensure StreamApiKey is not missing
      function getStreamApiKey(): string {
        const key = Constants.expoConfig?.extra?.streamApiKey;
        if (!key) {
          throw new Error("Missing STREAM_API_KEY in app.config.js or .env");
        }
        return key;
      }

      const apiKey = getStreamApiKey();
      const supabaseApiKey = Constants.expoConfig?.extra?.supabaseApiKey;

      // Creating the client for every call
      const newClient = new StreamVideoClient(apiKey);

      const response = await fetch(
        "https://ynikykgyystdyitckguc.supabase.co/functions/v1/create-stream-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseApiKey}`,
          },
          body: JSON.stringify({
            id: userDoc.userId,
            name: userDoc.name,
            role: userDoc.role,
          }),
        }
      );

      const data = await response.json();
      const token = data.token;

      if (!token) {
        console.error("No video token returned");
        return;
      }

      await newClient.connectUser(
        {
          id: userDoc.userId,
          name: userDoc.name || userDoc.role,
        },
        token
      );

      setClient(newClient);
      console.log("✅ Connected Stream Video user from CallScreen");
    };

    if (!client && userDoc?.userId) {
      initializeClient();
    }
  }, [userDoc]);

  useEffect(() => {
    const joinCall = async () => {
      if (!callId || !client) return;

      const _call = client.call("default", callId);

      try {
        await _call.join({
          create: true,
          data: {
            members: [{ user_id: tutorId ?? "" }, { user_id: tuteeId ?? "" }],
          },
        });

        console.log("✅ Joined call successfully");
        setCall(_call);
      } catch (err) {
        console.error("❌ Failed to join call:", err);
      }
    };

    joinCall();

    return () => {
      // Auto disconnect on unmount
      if (call?.state.callingState !== CallingState.LEFT) {
        call?.leave();
        client?.disconnectUser();
        console.log("User diconnected and left the call.");
      }
    };
  }, [client, callId]);

  if (!call) {
    console.log(call);
    return (
      <SafeAreaView>
        <View className="items-center flex-col justify-center w-full h-full">
          <ActivityIndicator size="large" />
          <Text className="font-asap-medium mt-4">Joining Call...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <OverlayProvider>
      <View className="pb-12 bg-black h-full">
        {client && (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent onHangupCallHandler={handleHangup} />
            </StreamCall>
          </StreamVideo>
        )}
      </View>
    </OverlayProvider>
  );
};

export default CallScreen;
