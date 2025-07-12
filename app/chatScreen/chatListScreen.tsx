import { useChat } from "@/contexts/ChatProvider";
import { auth } from "@/firebase";
import { router, Stack } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { ChannelSort } from "stream-chat"; // Import the correct type
import { ChannelList } from "stream-chat-expo";
import NullScreen from "../nullScreen";

export default function ChatListScreen() {
  if (!auth) return <NullScreen />;

  const { client, setChannel } = useChat();

  // If client is not registered, display loading screen
  if (!client || !client.userID) {
    return (
      <View className="items-center flex-col justify-center w-full h-full">
        <ActivityIndicator size="large" />
        <Text className="font-asap-medium mt-4">Loading all chats...</Text>
      </View>
    );
  }

  // Filter chat only if user are in it
  const filters = {
    members: { $in: [client?.userID] },
    type: "messaging",
  };

  const options = {
    state: true,
    watch: true,
  };

  // Sort chats by last texted/updated
  const sort: ChannelSort = {
    last_updated: -1,
  };

  return (
    // A small block of color at the top
    <View
      className={`flex-1 ${
        client?.user?.role === "tutor" ? "bg-primaryBlue" : "bg-primaryOrange"
      }`}
    >
      {/* Main chat list screen */}
      <View className="flex-1 mt-12">
        <Stack.Screen options={{ title: "Channel List Screen" }} />
        <ChannelList
          filters={filters}
          options={options}
          sort={sort}
          onSelect={(channel) => {
            setChannel(channel);
            router.push(`/chatScreen/${channel.cid}`);
          }}
        />
      </View>
    </View>
  );
}
