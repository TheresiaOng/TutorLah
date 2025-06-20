import { useAuth } from "@/contexts/AuthProvider";
import { useChat } from "@/contexts/ChatProvider";
import { useHeaderHeight } from "@react-navigation/elements";
import { router, Stack } from "expo-router";
import React, { useEffect } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import {
  Channel,
  MessageInput,
  MessageList,
  useAttachmentPickerContext,
} from "stream-chat-expo";

export default function ChannelScreen() {
  const { userDoc } = useAuth();
  const { channel } = useChat();
  const { setTopInset } = useAttachmentPickerContext();
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    setTopInset(headerHeight);
  }, [headerHeight, setTopInset]);

  if (!channel) {
    console.log(channel);
    return (
      <SafeAreaView>
        <Text>Loading chat ...</Text>
      </SafeAreaView>
    );
  }

  const otherMember = Object.values(channel.state.members).find(
    (m) => m.user?.id !== userDoc?.userId
  );

  const otherName = otherMember?.user?.name || "User";
  const otherRole = otherMember?.user?.role || "";
  const capitalizedRole =
    otherRole.charAt(0).toUpperCase() + otherRole.slice(1);

  return (
    <SafeAreaView
      className={`flex-1 ${
        userDoc?.role === "tutor" ? "bg-primaryBlue" : "bg-primaryOrange"
      }`}
    >
      <Stack.Screen options={{ title: "Channel Screen" }} />
      {channel ? (
        <Channel
          channel={channel}
          keyboardVerticalOffset={headerHeight}
          enableSwipeToReply={true}
        >
          {/* Custom Header */}
          <View
            className={`flex-row items-center p-4 ${
              userDoc?.role === "tutor" ? "bg-primaryBlue" : "bg-primaryOrange"
            }`}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Text
                className={`text-white text-3xl ${
                  userDoc?.role === "tutor" ? "text-white" : "text-darkBrown"
                }`}
              >
                ←
              </Text>
            </TouchableOpacity>
            <Text
              className={`font-asap-semibold ml-4 text-xl ${
                userDoc?.role === "tutor" ? "text-white" : "text-darkBrown"
              }`}
            >
              {otherName} [{capitalizedRole}]
            </Text>
          </View>

          <MessageList />
          <MessageInput />
        </Channel>
      ) : null}
    </SafeAreaView>
  );
}
