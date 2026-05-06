import type {
  ConversationListResponse,
  ConversationResponse,
  GetMessagesResponse,
  LeaveOrRemoveResponse,
  RecallMessageResponse,
  SendMessageResponse,
} from "../../types/message";
import instance from "../../utils/axiosCustomize";

const getConversationsService = () =>
  instance.get<ConversationListResponse>("/user/conversations");

const createOrGetDirectConversationService = (userId: number) =>
  instance.post<ConversationResponse>(`/user/conversations/direct/${userId}`);

const createGroupConversationService = (body: { name: string; userIds: number[] }) =>
  instance.post<ConversationResponse>("/user/conversations/group", body);

const updateDirectNicknameService = (conversationId: number, nickname: string) =>
  instance.patch<ConversationResponse>(`/user/conversations/${conversationId}/nickname`, {
    nickname,
  });

const getMessagesService = (conversationId: number, params?: { page?: number; limit?: number }) =>
  instance.get<GetMessagesResponse>(`/user/conversations/${conversationId}/messages`, {
    params,
  });

const sendMessageService = (
  conversationId: number,
  data: { body?: string; type?: "TEXT" | "IMAGE" | "FILE"; mediaUrl?: string; replyToId?: number },
) =>
  instance.post<SendMessageResponse>(`/user/conversations/${conversationId}/messages`, data);

const uploadChatAttachmentService = (conversationId: number, file: File, caption?: string) => {
  const formData = new FormData();
  formData.append("file", file);
  if (caption) formData.append("caption", caption);
  return instance.post<SendMessageResponse>(
    `/user/conversations/${conversationId}/attachments`,
    formData,
  );
};

const recallMessageService = (conversationId: number, messageId: number) =>
  instance.patch<RecallMessageResponse>(
    `/user/conversations/${conversationId}/messages/${messageId}/recall`,
  );

const addMembersService = (conversationId: number, userIds: number[]) =>
  instance.post<ConversationResponse>(`/user/conversations/${conversationId}/members`, {
    userIds,
  });

const removeMemberService = (conversationId: number, userId: number) =>
  instance.delete<LeaveOrRemoveResponse>(`/user/conversations/${conversationId}/members/${userId}`);

const leaveGroupService = (conversationId: number) =>
  instance.delete<LeaveOrRemoveResponse>(`/user/conversations/${conversationId}/leave`);

const deleteGroupService = (conversationId: number) =>
  instance.delete<LeaveOrRemoveResponse>(`/user/conversations/${conversationId}`);

const conversationService = {
  getConversationsService,
  createOrGetDirectConversationService,
  createGroupConversationService,
  updateDirectNicknameService,
  getMessagesService,
  sendMessageService,
  uploadChatAttachmentService,
  recallMessageService,
  addMembersService,
  removeMemberService,
  leaveGroupService,
  deleteGroupService,
};

export default conversationService;
