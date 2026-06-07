import type { ApiResponse } from "./api";

export type ConversationType = "PRIVATE" | "GROUP";
export type MessageType = "TEXT" | "IMAGE" | "FILE";

export type PresencePayload = {
  userId: number;
  isOnline: boolean;
  lastSeenAt: string | null;
};

export type ConversationParticipant = {
  userId: number;
  username: string;
  fullName?: string | null;
  avatar?: string | null;
  role: "ADMIN" | "MEMBER";
  joinedAt: string;
  isOnline?: boolean;
  lastSeenAt?: string | null;
};

export type ReplyToMessage = {
  id: number;
  senderName: string;
  body?: string | null;
  type: MessageType;
  mediaUrl?: string | null;
  isRecalled?: boolean;
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
  createdAt: string;
  mediaUrl?: string | null;
  isRecalled?: boolean;
  replyTo?: ReplyToMessage | null;
};

export type Conversation = {
  id: number;
  type: ConversationType;
  conversationName: string;
  avatar?: string | null;
  updatedAt: string;
  participants: ConversationParticipant[];
  otherParticipant?: {
    id: number;
    username?: string;
    fullName?: string | null;
    avatar?: string | null;
    isOnline: boolean;
    lastSeenAt?: string | null;
  } | null;
  membersCount?: number;
  onlineMembersCount?: number;
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
