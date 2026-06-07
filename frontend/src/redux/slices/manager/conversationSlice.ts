import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import conversationService from "../../../services/manager/conversationService";
import type { ApiErrorType } from "../../../types/error";
import type {
  ChatMessage,
  Conversation,
  ConversationListResponse,
  ConversationResponse,
  GetMessagesResponse,
  LeaveOrRemoveResponse,
  PresencePayload,
  SendMessageResponse,
} from "../../../types/message";
import type { UserSearchResponse } from "../../../types/userSearch";

interface ConversationState {
  conversations: Conversation[];
  messagesByConversation: Record<number, ChatMessage[]>;
  selectedConversationId?: number;
}

const initialState: ConversationState = {
  conversations: [],
  messagesByConversation: {},
  selectedConversationId: undefined,
};

const upsertConversationInList = (state: ConversationState, conversation: Conversation) => {
  const idx = state.conversations.findIndex((c) => c.id === conversation.id);
  if (idx >= 0) state.conversations[idx] = conversation;
  else state.conversations.unshift(conversation);
};

const applyLastMessageFromSend = (state: ConversationState, cid: number, msg: ChatMessage) => {
  const idx = state.conversations.findIndex((c) => c.id === cid);
  if (idx >= 0) {
    state.conversations[idx].lastMessage = msg;
    state.conversations[idx].updatedAt = msg.createdAt;
  }
};

const applyPresence = (state: ConversationState, presence: PresencePayload) => {
  state.conversations.forEach((conversation) => {
    let hasParticipant = false;

    conversation.participants = conversation.participants.map((participant) => {
      if (participant.userId !== presence.userId) return participant;
      hasParticipant = true;
      return {
        ...participant,
        isOnline: presence.isOnline,
        lastSeenAt: presence.lastSeenAt,
      };
    });

    if (conversation.otherParticipant?.id === presence.userId) {
      conversation.otherParticipant = {
        ...conversation.otherParticipant,
        isOnline: presence.isOnline,
        lastSeenAt: presence.lastSeenAt,
      };
    }

    if (hasParticipant) {
      conversation.onlineMembersCount = conversation.participants.reduce(
        (count, participant) => count + (participant.isOnline ? 1 : 0),
        0,
      );
      conversation.membersCount = conversation.participants.length;
    }
  });
};

export const getManagerConversations = createAsyncThunk<
  ConversationListResponse,
  void,
  { rejectValue: ApiErrorType }
>("managerConversation/getConversations", async (_, { rejectWithValue }) => {
  try {
    const res = await conversationService.getConversationsService();
    return res.data as ConversationListResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const searchManagerBranchMembers = createAsyncThunk<
  UserSearchResponse,
  { q: string; limit?: number },
  { rejectValue: ApiErrorType }
>("managerConversation/searchBranchMembers", async ({ q, limit }, { rejectWithValue }) => {
  try {
    const res = await conversationService.searchBranchMembersService(q, limit);
    return res.data as UserSearchResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const createOrGetManagerDirectConversation = createAsyncThunk<
  ConversationResponse,
  { userId: number },
  { rejectValue: ApiErrorType }
>("managerConversation/createOrGetDirectConversation", async ({ userId }, { rejectWithValue }) => {
  try {
    const res = await conversationService.createOrGetDirectConversationService(userId);
    return res.data as ConversationResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const createManagerGroupConversation = createAsyncThunk<
  ConversationResponse,
  { name: string; userIds: number[] },
  { rejectValue: ApiErrorType }
>("managerConversation/createGroupConversation", async (body, { rejectWithValue }) => {
  try {
    const res = await conversationService.createGroupConversationService(body);
    return res.data as ConversationResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getManagerMessages = createAsyncThunk<
  { conversationId: number; payload: GetMessagesResponse },
  { conversationId: number; params?: { page?: number; limit?: number } },
  { rejectValue: ApiErrorType }
>("managerConversation/getMessages", async ({ conversationId, params }, { rejectWithValue }) => {
  try {
    const res = await conversationService.getMessagesService(conversationId, params);
    return { conversationId, payload: res.data as GetMessagesResponse };
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const sendManagerMessage = createAsyncThunk<
  { conversationId: number; payload: SendMessageResponse },
  {
    conversationId: number;
    data: { body?: string; type?: "TEXT" | "IMAGE" | "FILE"; mediaUrl?: string; replyToId?: number };
  },
  { rejectValue: ApiErrorType }
>("managerConversation/sendMessage", async ({ conversationId, data }, { rejectWithValue }) => {
  try {
    const res = await conversationService.sendMessageService(conversationId, data);
    return { conversationId, payload: res.data as SendMessageResponse };
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const uploadManagerChatAttachment = createAsyncThunk<
  { conversationId: number; payload: SendMessageResponse },
  { conversationId: number; file: File; caption?: string },
  { rejectValue: ApiErrorType }
>("managerConversation/uploadChatAttachment", async ({ conversationId, file, caption }, { rejectWithValue }) => {
  try {
    const res = await conversationService.uploadChatAttachmentService(conversationId, file, caption);
    return { conversationId, payload: res.data as SendMessageResponse };
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const recallManagerMessage = createAsyncThunk<
  { conversationId: number; messageId: number },
  { conversationId: number; messageId: number },
  { rejectValue: ApiErrorType }
>("managerConversation/recallMessage", async ({ conversationId, messageId }, { rejectWithValue }) => {
  try {
    await conversationService.recallMessageService(conversationId, messageId);
    return { conversationId, messageId };
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const addMembersToManagerGroup = createAsyncThunk<
  ConversationResponse,
  { conversationId: number; userIds: number[] },
  { rejectValue: ApiErrorType }
>("managerConversation/addMembersToGroup", async ({ conversationId, userIds }, { rejectWithValue }) => {
  try {
    const res = await conversationService.addMembersService(conversationId, userIds);
    return res.data as ConversationResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const removeMemberFromManagerGroup = createAsyncThunk<
  LeaveOrRemoveResponse,
  { conversationId: number; userId: number },
  { rejectValue: ApiErrorType }
>("managerConversation/removeMemberFromGroup", async ({ conversationId, userId }, { rejectWithValue }) => {
  try {
    const res = await conversationService.removeMemberService(conversationId, userId);
    return res.data as LeaveOrRemoveResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const leaveManagerGroup = createAsyncThunk<
  LeaveOrRemoveResponse,
  { conversationId: number },
  { rejectValue: ApiErrorType }
>("managerConversation/leaveGroup", async ({ conversationId }, { rejectWithValue }) => {
  try {
    const res = await conversationService.leaveGroupService(conversationId);
    return res.data as LeaveOrRemoveResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const deleteManagerGroupConversation = createAsyncThunk<
  LeaveOrRemoveResponse,
  { conversationId: number },
  { rejectValue: ApiErrorType }
>("managerConversation/deleteGroupConversation", async ({ conversationId }, { rejectWithValue }) => {
  try {
    const res = await conversationService.deleteGroupService(conversationId);
    return res.data as LeaveOrRemoveResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const removeConversation = (state: ConversationState, id: number) => {
  state.conversations = state.conversations.filter((c) => c.id !== id);
  delete state.messagesByConversation[id];
  if (state.selectedConversationId === id) state.selectedConversationId = undefined;
};

const conversationSlice = createSlice({
  name: "managerConversation",
  initialState,
  reducers: {
    selectManagerConversation: (state, action: PayloadAction<number>) => {
      state.selectedConversationId = action.payload;
    },
    clearSelectedManagerConversation: (state) => {
      state.selectedConversationId = undefined;
    },
    appendManagerSocketMessage: (
      state,
      action: PayloadAction<{ message: ChatMessage; currentUserId: number }>,
    ) => {
      const { message: msg, currentUserId } = action.payload;
      const list = state.messagesByConversation[msg.conversationId] || [];
      const existed = list.some((m) => m.id === msg.id);

      if (!existed) {
        state.messagesByConversation[msg.conversationId] = [...list, msg];
      }

      const idx = state.conversations.findIndex((c) => c.id === msg.conversationId);
      if (idx >= 0) {
        state.conversations[idx].lastMessage = msg;
        state.conversations[idx].updatedAt = msg.createdAt;
        if (!existed && msg.senderId !== currentUserId && state.selectedConversationId !== msg.conversationId) {
          state.conversations[idx].unreadCount = (state.conversations[idx].unreadCount || 0) + 1;
        }
      }
    },
    markManagerMessageRecalled: (state, action: PayloadAction<{ id: number; conversationId: number }>) => {
      const { id, conversationId } = action.payload;
      const list = state.messagesByConversation[conversationId];
      if (list) {
        const i = list.findIndex((m) => m.id === id);
        if (i >= 0) list[i] = { ...list[i], isRecalled: true, body: "", mediaUrl: null };
      }
      const cidx = state.conversations.findIndex((c) => c.id === conversationId);
      if (cidx >= 0 && state.conversations[cidx].lastMessage?.id === id) {
        const lm = state.conversations[cidx].lastMessage!;
        state.conversations[cidx].lastMessage = { ...lm, isRecalled: true, body: "", mediaUrl: null };
      }
    },
    clearManagerUnreadFromSocket: (
      state,
      action: PayloadAction<{ conversationId: number; readerId: number; selfId: number }>,
    ) => {
      const { conversationId, readerId, selfId } = action.payload;
      if (readerId !== selfId) return;
      const idx = state.conversations.findIndex((c) => c.id === conversationId);
      if (idx >= 0) state.conversations[idx].unreadCount = 0;
    },
    removeManagerConversationLocal: (state, action: PayloadAction<number>) => {
      removeConversation(state, action.payload);
    },
    managerUserPresenceChanged: (state, action: PayloadAction<PresencePayload>) => {
      applyPresence(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getManagerConversations.fulfilled, (state, action) => {
        state.conversations = action.payload.data;
      })
      .addCase(createOrGetManagerDirectConversation.fulfilled, (state, action) => {
        upsertConversationInList(state, action.payload.data);
        state.selectedConversationId = action.payload.data.id;
      })
      .addCase(createManagerGroupConversation.fulfilled, (state, action) => {
        upsertConversationInList(state, action.payload.data);
        state.selectedConversationId = action.payload.data.id;
      })
      .addCase(getManagerMessages.fulfilled, (state, action) => {
        state.messagesByConversation[action.payload.conversationId] =
          action.payload.payload.data.data;
        const idx = state.conversations.findIndex((c) => c.id === action.payload.conversationId);
        if (idx >= 0) state.conversations[idx].unreadCount = 0;
      })
      .addCase(sendManagerMessage.fulfilled, (state, action) => {
        const msg = action.payload.payload.data;
        const cid = action.payload.conversationId;
        const list = state.messagesByConversation[cid] || [];
        if (!list.some((m) => m.id === msg.id)) state.messagesByConversation[cid] = [...list, msg];
        applyLastMessageFromSend(state, cid, msg);
      })
      .addCase(uploadManagerChatAttachment.fulfilled, (state, action) => {
        const msg = action.payload.payload.data;
        const cid = action.payload.conversationId;
        const list = state.messagesByConversation[cid] || [];
        if (!list.some((m) => m.id === msg.id)) state.messagesByConversation[cid] = [...list, msg];
        applyLastMessageFromSend(state, cid, msg);
      })
      .addCase(recallManagerMessage.fulfilled, (state, action) => {
        const { conversationId, messageId } = action.payload;
        const list = state.messagesByConversation[conversationId];
        if (list) {
          const i = list.findIndex((m) => m.id === messageId);
          if (i >= 0) list[i] = { ...list[i], isRecalled: true, body: "", mediaUrl: null };
        }
      })
      .addCase(addMembersToManagerGroup.fulfilled, (state, action) => {
        upsertConversationInList(state, action.payload.data);
      })
      .addCase(removeMemberFromManagerGroup.fulfilled, (state, action) => {
        const data = action.payload.data as unknown as Conversation | { deleted?: boolean; left?: boolean; conversationId: number };
        if (typeof data === "object" && data && "conversationId" in data && (data.deleted || data.left)) {
          removeConversation(state, data.conversationId);
        } else {
          upsertConversationInList(state, data as Conversation);
        }
      })
      .addCase(leaveManagerGroup.fulfilled, (state, action) => {
        const data = action.payload.data as unknown as Conversation | { deleted?: boolean; left?: boolean; conversationId: number };
        if (typeof data === "object" && data && "conversationId" in data && (data.deleted || data.left)) {
          removeConversation(state, data.conversationId);
        }
      })
      .addCase(deleteManagerGroupConversation.fulfilled, (state, action) => {
        const data = action.payload.data as unknown as Conversation | { conversationId: number };
        const id = typeof data === "object" && data && "conversationId" in data ? data.conversationId : (data as Conversation).id;
        removeConversation(state, id);
      });
  },
});

export const {
  selectManagerConversation,
  clearSelectedManagerConversation,
  appendManagerSocketMessage,
  markManagerMessageRecalled,
  clearManagerUnreadFromSocket,
  removeManagerConversationLocal,
  managerUserPresenceChanged,
} = conversationSlice.actions;

export default conversationSlice.reducer;
