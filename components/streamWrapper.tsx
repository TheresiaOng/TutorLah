import { useAuth } from "@/contexts/AuthProvider";
import { ChatProvider } from "@/contexts/ChatProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import React, { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { StreamChat } from "stream-chat";
import { Chat, OverlayProvider } from "stream-chat-expo";

export const ChatWrapper = ({ children }: { children: ReactNode }) => {
  const [isChatReady, setIsChatReady] = useState(false);
  const { userDoc } = useAuth();

  function getStreamApiKey(): string {
    const key = Constants.expoConfig?.extra?.streamApiKey;
    if (!key) {
      throw new Error("Missing STREAM_API_KEY in app.config.js or .env");
    }
    return key;
  }

  const apiKey = getStreamApiKey();

  const chatClient = StreamChat.getInstance(apiKey);
  const supabaseApiKey = Constants.expoConfig?.extra?.supabaseApiKey;

  useEffect(() => {
    const resetAndConnect = async () => {
      if (!userDoc) {
        console.log("No user found");
        return;
      }

      if (chatClient.userID === userDoc.userId) {
        setIsChatReady(true);
        return;
      }

      console.log("Connecting streamChat user: ", userDoc);

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
      const { token } = data;

      if (!token) {
        console.error("No token returned from Supabase function");
      }

      try {
        if (chatClient.userID !== userDoc.userId) {
          console.log("Trying to connect user to chat");
          await chatClient.connectUser(
            {
              id: userDoc.userId,
              name: userDoc.name || userDoc.role,
            },
            token
          );
          console.log("✅ StreamChat user connected");
          setIsChatReady(true);
        } else {
          console.log("User already logged in");
        }
      } catch (error) {
        console.error("StreamChat connect failed:", error);
      }
    };

    resetAndConnect();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [userDoc?.userId]);

  if (!userDoc) {
    return <>{children}</>;
  }

  if (!chatClient) {
    return (
      <View className="bg-white h-full w-full items-center justify-center">
        <ActivityIndicator size="large" />
        <Text>Retrieving documents</Text>
      </View>
    );
  }

  return (
    <OverlayProvider>
      <Chat client={chatClient}>
        <BottomSheetModalProvider>
          <ChatProvider
            client={chatClient}
            isChatReady={isChatReady}
            setIsChatReady={setIsChatReady}
          >
            {children}
          </ChatProvider>
        </BottomSheetModalProvider>
      </Chat>
    </OverlayProvider>
  );
};
