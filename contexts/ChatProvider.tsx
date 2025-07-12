import React, { createContext, ReactNode, useContext, useState } from "react";
import { Channel, StreamChat } from "stream-chat";

type ChatContextType = {
  client: StreamChat;
  channel: Channel | null;
  setChannel: React.Dispatch<React.SetStateAction<Channel | null>>;
  isChatReady: boolean;
  setIsChatReady: React.Dispatch<React.SetStateAction<boolean>>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({
  children,
  client,
  isChatReady,
  setIsChatReady,
}: {
  children: ReactNode;
  client: StreamChat;
  isChatReady: boolean;
  setIsChatReady: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [channel, setChannel] = useState<any>(null);

  return (
    <ChatContext.Provider
      value={{ client, channel, isChatReady, setChannel, setIsChatReady }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
