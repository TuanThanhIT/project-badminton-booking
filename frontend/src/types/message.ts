import type { ApiResponse } from "./api";

export type ConversationType = "Private" | "Group";
export type MessageType = "Text" | "Image" | "File";

export type ConversationParticipant = {
  userId: number;
  username: string;
  fullName?: string | null;
  avatar?: string | null;
  role: "Admin" | "Member";
  joinedAt: string;
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string | null;
  body: string;
  type: MessageType;
  isRead: boolean;
  createdDate: string;
  mediaUrl?: string | null;
  isRecalled?: boolean;
};

export type Conversation = {
  id: number;
  type: ConversationType;
  conversationName: string;
  avatar?: string | null;
  updatedDate: string;
  participants: ConversationParticipant[];
  unreadCount: number;
  lastMessage?: ChatMessage | null;
};

export type ConversationListResponse = ApiResponse<Conversation[]>;
export type ConversationResponse = ApiResponse<Conversation>;

export type GetMessagesData = {
  total: number;
  page: number;
  limit: number;
  data: ChatMessage[];
};
export type GetMessagesResponse = ApiResponse<GetMessagesData>;
export type SendMessageResponse = ApiResponse<ChatMessage>;

export type RecallMessageResponse = ApiResponse<{
  id: number;
  conversationId: number;
  isRecalled: boolean;
}>;

export type LeaveOrRemoveResponse = ApiResponse<Conversation | { deleted: boolean; conversationId: number }>;
