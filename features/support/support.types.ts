export type SupportChatSender = "user" | "bot";

export type SupportChatMessage = {
  id: string;
  text: string;
  sender: SupportChatSender;
  timestamp?: number;
};
