import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ApiErrorType } from "../../../types/error";
import type {
  ChatMessage,
  Conversation,
  ConversationListResponse,
  ConversationResponse,
  GetMessagesResponse,
  LeaveOrRemoveResponse,
  SendMessageResponse,
} from "../../../types/message";
import conversationService from "../../../services/user/conversationService";

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

export const getConversations = createAsyncThunk<
  ConversationListResponse,
  void,
  { rejectValue: ApiErrorType }
>("conversation/getConversations", async (_, { rejectWithValue }) => {
  try {
    const res = await conversationService.getConversationsService();
    return res.data as ConversationListResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const createOrGetDirectConversation = createAsyncThunk<
  ConversationResponse,
  { userId: number },
  { rejectValue: ApiErrorType }
>("conversation/createOrGetDirectConversation", async ({ userId }, { rejectWithValue }) => {
  try {
    const res = await conversationService.createOrGetDirectConversationService(userId);
    return res.data as ConversationResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const createGroupConversation = createAsyncThunk<
  ConversationResponse,
  { name: string; userIds: number[] },
  { rejectValue: ApiErrorType }
>("conversation/createGroupConversation", async (body, { rejectWithValue }) => {
  try {
    const res = await conversationService.createGroupConversationService(body);
    return res.data as ConversationResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const updateDirectNickname = createAsyncThunk<
  ConversationResponse,
  { conversationId: number; nickname: string },
  { rejectValue: ApiErrorType }
>("conversation/updateDirectNickname", async ({ conversationId, nickname }, { rejectWithValue }) => {
  try {
    const res = await conversationService.updateDirectNicknameService(conversationId, nickname);
    return res.data as ConversationResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const getMessages = createAsyncThunk<
  { conversationId: number; payload: GetMessagesResponse },
  { conversationId: number; params?: { page?: number; limit?: number } },
  { rejectValue: ApiErrorType }
>("conversation/getMessages", async ({ conversationId, params }, { rejectWithValue }) => {
  try {
    const res = await conversationService.getMessagesService(conversationId, params);
    return { conversationId, payload: res.data as GetMessagesResponse };
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const sendMessage = createAsyncThunk<
  { conversationId: number; payload: SendMessageResponse },
  {
    conversationId: number;
    data: { body?: string; type?: "TEXT" | "IMAGE" | "FILE"; mediaUrl?: string; replyToId?: number };
  },
  { rejectValue: ApiErrorType }
>("conversation/sendMessage", async ({ conversationId, data }, { rejectWithValue }) => {
  try {
    const res = await conversationService.sendMessageService(conversationId, data);
    return { conversationId, payload: res.data as SendMessageResponse };
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const uploadChatAttachment = createAsyncThunk<
  { conversationId: number; payload: SendMessageResponse },
  { conversationId: number; file: File; caption?: string },
  { rejectValue: ApiErrorType }
>("conversation/uploadChatAttachment", async ({ conversationId, file, caption }, { rejectWithValue }) => {
  try {
    const res = await conversationService.uploadChatAttachmentService(conversationId, file, caption);
    return { conversationId, payload: res.data as SendMessageResponse };
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const recallMessage = createAsyncThunk<
  { conversationId: number; messageId: number },
  { conversationId: number; messageId: number },
  { rejectValue: ApiErrorType }
>("conversation/recallMessage", async ({ conversationId, messageId }, { rejectWithValue }) => {
  try {
    await conversationService.recallMessageService(conversationId, messageId);
    return { conversationId, messageId };
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const addMembersToGroup = createAsyncThunk<
  ConversationResponse,
  { conversationId: number; userIds: number[] },
  { rejectValue: ApiErrorType }
>("conversation/addMembersToGroup", async ({ conversationId, userIds }, { rejectWithValue }) => {
  try {
    const res = await conversationService.addMembersService(conversationId, userIds);
    return res.data as ConversationResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const removeMemberFromGroup = createAsyncThunk<
  LeaveOrRemoveResponse,
  { conversationId: number; userId: number },
  { rejectValue: ApiErrorType }
>("conversation/removeMemberFromGroup", async ({ conversationId, userId }, { rejectWithValue }) => {
  try {
    const res = await conversationService.removeMemberService(conversationId, userId);
    return res.data as LeaveOrRemoveResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const leaveGroup = createAsyncThunk<
  LeaveOrRemoveResponse,
  { conversationId: number },
  { rejectValue: ApiErrorType }
>("conversation/leaveGroup", async ({ conversationId }, { rejectWithValue }) => {
  try {
    const res = await conversationService.leaveGroupService(conversationId);
    return res.data as LeaveOrRemoveResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

export const deleteGroupConversation = createAsyncThunk<
  LeaveOrRemoveResponse,
  { conversationId: number },
  { rejectValue: ApiErrorType }
>("conversation/deleteGroupConversation", async ({ conversationId }, { rejectWithValue }) => {
  try {
    const res = await conversationService.deleteGroupService(conversationId);
    return res.data as LeaveOrRemoveResponse;
  } catch (error) {
    return rejectWithValue(error as ApiErrorType);
  }
});

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    selectConversation: (state, action: PayloadAction<number>) => {
      state.selectedConversationId = action.payload;
    },
    appendSocketMessage: (
      state,
      action: PayloadAction<{ message: ChatMessage; currentUserId: number }>,
    ) => {
      const { message: msg, currentUserId } = action.payload;
      const list = state.messagesByConversation[msg.conversationId] || [];
      const exists = list.some((m) => m.id === msg.id);
      if (!exists) {
        state.messagesByConversation[msg.conversationId] = [...list, msg];
      }
      const idx = state.conversations.findIndex((c) => c.id === msg.conversationId);
      if (idx >= 0) {
        state.conversations[idx].lastMessage = msg;
        state.conversations[idx].updatedAt = msg.createdAt;
        const isOther = msg.senderId !== currentUserId;
        const notOpen = state.selectedConversationId !== msg.conversationId;
        if (isOther && notOpen) {
          state.conversations[idx].unreadCount = (state.conversations[idx].unreadCount || 0) + 1;
        }
      }
    },
    markMessageRecalled: (state, action: PayloadAction<{ id: number; conversationId: number }>) => {
      const { id, conversationId } = action.payload;
      const list = state.messagesByConversation[conversationId];
      if (list) {
        const i = list.findIndex((m) => m.id === id);
        if (i >= 0) {
          list[i] = { ...list[i], isRecalled: true, body: "", mediaUrl: null };
        }
      }
      const cidx = state.conversations.findIndex((c) => c.id === conversationId);
      if (cidx >= 0 && state.conversations[cidx].lastMessage?.id === id) {
        const lm = state.conversations[cidx].lastMessage!;
        state.conversations[cidx].lastMessage = {
          ...lm,
          isRecalled: true,
          body: "",
          mediaUrl: null,
        };
      }
    },
    clearUnreadFromSocket: (
      state,
      action: PayloadAction<{ conversationId: number; readerId: number; selfId: number }>,
    ) => {
      const { conversationId, readerId, selfId } = action.payload;
      if (readerId !== selfId) return;
      const idx = state.conversations.findIndex((c) => c.id === conversationId);
      if (idx >= 0) state.conversations[idx].unreadCount = 0;
    },
    removeConversationLocal: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      state.conversations = state.conversations.filter((c) => c.id !== id);
      delete state.messagesByConversation[id];
      if (state.selectedConversationId === id) {
        state.selectedConversationId = undefined;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConversations.fulfilled, (state, action) => {
        state.conversations = action.payload.data;
      })
      .addCase(createOrGetDirectConversation.fulfilled, (state, action) => {
        const conversation = action.payload.data;
        upsertConversationInList(state, conversation);
        state.selectedConversationId = conversation.id;
      })
      .addCase(createGroupConversation.fulfilled, (state, action) => {
        const conversation = action.payload.data;
        upsertConversationInList(state, conversation);
        state.selectedConversationId = conversation.id;
      })
      .addCase(updateDirectNickname.fulfilled, (state, action) => {
        upsertConversationInList(state, action.payload.data);
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messagesByConversation[action.payload.conversationId] =
          action.payload.payload.data.data;
        const idx = state.conversations.findIndex((c) => c.id === action.payload.conversationId);
        if (idx >= 0) state.conversations[idx].unreadCount = 0;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const msg = action.payload.payload.data;
        const cid = action.payload.conversationId;
        const list = state.messagesByConversation[cid] || [];
        if (!list.some((m) => m.id === msg.id)) {
          state.messagesByConversation[cid] = [...list, msg];
        }
        applyLastMessageFromSend(state, cid, msg);
      })
      .addCase(uploadChatAttachment.fulfilled, (state, action) => {
        const msg = action.payload.payload.data;
        const cid = action.payload.conversationId;
        const list = state.messagesByConversation[cid] || [];
        if (!list.some((m) => m.id === msg.id)) {
          state.messagesByConversation[cid] = [...list, msg];
        }
        applyLastMessageFromSend(state, cid, msg);
      })
      .addCase(recallMessage.fulfilled, (state, action) => {
        const { conversationId, messageId } = action.payload;
        const list = state.messagesByConversation[conversationId];
        if (list) {
          const i = list.findIndex((m) => m.id === messageId);
          if (i >= 0) {
            list[i] = { ...list[i], isRecalled: true, body: "", mediaUrl: null };
          }
        }
        const cidx = state.conversations.findIndex((c) => c.id === conversationId);
        if (cidx >= 0 && state.conversations[cidx].lastMessage?.id === messageId) {
          const lm = state.conversations[cidx].lastMessage!;
          state.conversations[cidx].lastMessage = {
            ...lm,
            isRecalled: true,
            body: "",
            mediaUrl: null,
          };
        }
      })
      .addCase(addMembersToGroup.fulfilled, (state, action) => {
        upsertConversationInList(state, action.payload.data);
      })
      .addCase(removeMemberFromGroup.fulfilled, (state, action) => {
        const data = action.payload.data as unknown as
          | Conversation
          | { deleted?: boolean; left?: boolean; conversationId: number };
        const shouldRemove =
          data &&
          typeof data === "object" &&
          (("deleted" in data && Boolean(data.deleted)) || ("left" in data && Boolean(data.left)));
        if (shouldRemove && typeof data === "object" && "conversationId" in data) {
          const id = data.conversationId;
          state.conversations = state.conversations.filter((c) => c.id !== id);
          delete state.messagesByConversation[id];
          if (state.selectedConversationId === id) state.selectedConversationId = undefined;
        } else {
          upsertConversationInList(state, data as Conversation);
        }
      })
      .addCase(leaveGroup.fulfilled, (state, action) => {
        const data = action.payload.data as unknown as
          | Conversation
          | { deleted?: boolean; left?: boolean; conversationId: number };
        const shouldRemove =
          data &&
          typeof data === "object" &&
          (("deleted" in data && Boolean(data.deleted)) || ("left" in data && Boolean(data.left)));
        if (shouldRemove && typeof data === "object" && "conversationId" in data) {
          const id = data.conversationId;
          state.conversations = state.conversations.filter((c) => c.id !== id);
          delete state.messagesByConversation[id];
          if (state.selectedConversationId === id) state.selectedConversationId = undefined;
        } else {
          upsertConversationInList(state, data as Conversation);
        }
      })
      .addCase(deleteGroupConversation.fulfilled, (state, action) => {
        const data = action.payload.data as unknown as
          | Conversation
          | { deleted?: boolean; conversationId: number };
        const id =
          typeof data === "object" && data && "conversationId" in data ? data.conversationId : (data as Conversation).id;
        state.conversations = state.conversations.filter((c) => c.id !== id);
        delete state.messagesByConversation[id];
        if (state.selectedConversationId === id) state.selectedConversationId = undefined;
      });
  },
});

export const {
  selectConversation,
  appendSocketMessage,
  markMessageRecalled,
  clearUnreadFromSocket,
  removeConversationLocal,
} = conversationSlice.actions;
export default conversationSlice.reducer;
