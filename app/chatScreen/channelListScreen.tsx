import { useChat } from "@/contexts/ChatProvider";
import { router, Stack } from "expo-router";
import { Text, View } from "react-native";
import { ChannelSort } from "stream-chat"; // Import the correct type
import { ChannelList } from "stream-chat-expo";

export default function ChannelListScreen() {
  const { client, setChannel } = useChat();

  if (!client || !client.userID) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading chat client...</Text>
      </View>
    );
  }

  const filters = {
    members: { $in: [client?.userID] },
    type: "messaging",
  };

  const options = {
    state: true,
    watch: true,
  };

  const sort: ChannelSort = {
    last_updated: -1, // or updated_at: 'desc'
  };

  return (
    <View
      className={`flex-1 ${
        client?.user?.role === "tutor" ? "bg-primaryBlue" : "bg-primaryOrange"
      }`}
    >
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
