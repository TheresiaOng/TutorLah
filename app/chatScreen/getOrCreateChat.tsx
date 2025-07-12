import { StreamChat } from "stream-chat";

type GetOrCreateChatProps = {
  client: StreamChat;
  currentUserId: string;
  otherUserId: string;
};

const GetOrCreateChat = async ({
  client,
  currentUserId,
  otherUserId,
}: GetOrCreateChatProps) => {
  const members = [currentUserId, otherUserId].sort();
  const channel = client.channel("messaging", {
    members,
  });

  await channel.watch();
  return channel;
};

export default GetOrCreateChat;
