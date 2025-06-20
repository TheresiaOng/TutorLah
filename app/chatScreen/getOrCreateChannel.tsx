import { StreamChat } from "stream-chat";

type GetOrCreateChannelProps = {
  client: StreamChat;
  currentUserId: string;
  otherUserId: string;
};

const GetOrCreateChannel = async ({
  client,
  currentUserId,
  otherUserId,
}: GetOrCreateChannelProps) => {
  const members = [currentUserId, otherUserId].sort();
  const channel = client.channel("messaging", {
    members,
  });

  await channel.watch();
  return channel;
};

export default GetOrCreateChannel;
