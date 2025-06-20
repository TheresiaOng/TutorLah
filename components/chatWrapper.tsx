import { useAuth } from "@/contexts/AuthProvider";
import { ChatProvider } from "@/contexts/ChatProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import React, { ReactNode, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { Chat, OverlayProvider } from "stream-chat-expo";

function getStreamApiKey(): string {
  const key = Constants.expoConfig?.extra?.streamApiKey;
  if (!key) {
    throw new Error("Missing STREAM_API_KEY in app.config.js or .env");
  }
  return key;
}

const client = StreamChat.getInstance(getStreamApiKey());

export const ChatWrapper = ({ children }: { children: ReactNode }) => {
  const [isChatReady, setIsChatReady] = useState(false);
  const { userDoc } = useAuth();

  useEffect(() => {
    const resetAndConnect = async () => {
      if (!userDoc) {
        console.log("No user found");
        return;
      }

      if (client.userID === userDoc.userId) {
        setIsChatReady(true);
        return;
      }

      console.log("Connecting stream user: ", userDoc);

      const response = await fetch(
        "https://ynikykgyystdyitckguc.supabase.co/functions/v1/create-stream-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluaWt5a2d5eXN0ZHlpdGNrZ3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDY2MjQsImV4cCI6MjA2NTU4MjYyNH0._fFlVovJ6dO7XdPXG9BwAgCyONTJEJakRnWefN51L7c`,
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
        if (client.userID !== userDoc.userId) {
          console.log("Trying to connect user");
          await client.connectUser(
            {
              id: userDoc.userId,
              name: userDoc.name || userDoc.role,
            },
            token
          );
          console.log("✅ Stream user connected");
          setIsChatReady(true);
        } else {
          console.log("User already logged in");
        }
      } catch (error) {
        console.error("❌ Stream connectUser failed:", error);
      }
    };

    resetAndConnect();

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [userDoc?.userId]);

  if (!userDoc && !isChatReady) {
    return <>{children}</>;
  }

  return (
    <OverlayProvider>
      <Chat client={client}>
        <BottomSheetModalProvider>
          <ChatProvider client={client}>{children}</ChatProvider>
        </BottomSheetModalProvider>
      </Chat>
    </OverlayProvider>
  );
};
