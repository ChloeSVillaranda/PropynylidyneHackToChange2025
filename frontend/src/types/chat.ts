export interface ChatMessage {
  roomId: string;
  createdAt: string;
  messageId: string;
  author?: string | null;
  text: string;
}


