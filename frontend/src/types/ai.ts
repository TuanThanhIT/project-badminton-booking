export type AiChatContextType = "general" | "booking" | "shopping" | "coach";

export type AiChatRequest = {
  message: string;
  context: AiChatContextType;
  sessionId?: number;
  guestToken?: string;
  branchId?: number;
  courtId?: number;
  productId?: number;
  history?: { role: "user" | "assistant"; content: string }[];
};

export type AiChatMessage = {
  id: string;
  content: string;
  isUser: boolean;
  isStreaming?: boolean;
  createdAt: number;
};

export type AiStoredMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type AiStreamCallbacks = {
  onChunk: (content: string) => void;
  onStatus?: (message: string) => void;
  onComplete?: (meta: { sessionId?: number; guestToken?: string }) => void;
  onError?: (error: string) => void;
};
