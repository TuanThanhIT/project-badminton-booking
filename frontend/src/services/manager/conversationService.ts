import type {
  ConversationListResponse,
  ConversationResponse,
  GetMessagesResponse,
  LeaveOrRemoveResponse,
  RecallMessageResponse,
  SendMessageResponse,
} from "../../types/message";
import type { UserSearchResponse } from "../../types/userSearch";
import instance from "../../utils/axiosCustomize";

const getConversationsService = () =>
  instance.get<ConversationListResponse>("/manager/conversations");

const searchBranchMembersService = (q: string, limit = 15) =>
  instance.get<UserSearchResponse>("/manager/conversations/members/search", {
    params: { q, limit },
  });

const createOrGetDirectConversationService = (userId: number) =>
  instance.post<ConversationResponse>(`/manager/conversations/direct/${userId}`);

const createGroupConversationService = (body: { name: string; userIds: number[] }) =>
  instance.post<ConversationResponse>("/manager/conversations/group", body);

const getMessagesService = (conversationId: number, params?: { page?: number; limit?: number }) =>
  instance.get<GetMessagesResponse>(`/manager/conversations/${conversationId}/messages`, {
    params,
  });

const sendMessageService = (
  conversationId: number,
  data: { body?: string; type?: "TEXT" | "IMAGE" | "FILE"; mediaUrl?: string; replyToId?: number },
) =>
  instance.post<SendMessageResponse>(`/manager/conversations/${conversationId}/messages`, data);

const uploadChatAttachmentService = (conversationId: number, file: File, caption?: string) => {
  const formData = new FormData();
  formData.append("file", file);
  if (caption) formData.append("caption", caption);
  return instance.post<SendMessageResponse>(
    `/manager/conversations/${conversationId}/attachments`,
    formData,
  );
};

const recallMessageService = (conversationId: number, messageId: number) =>
  instance.patch<RecallMessageResponse>(
    `/manager/conversations/${conversationId}/messages/${messageId}/recall`,
  );

const addMembersService = (conversationId: number, userIds: number[]) =>
  instance.post<ConversationResponse>(`/manager/conversations/${conversationId}/members`, {
    userIds,
  });

const removeMemberService = (conversationId: number, userId: number) =>
  instance.delete<LeaveOrRemoveResponse>(
    `/manager/conversations/${conversationId}/members/${userId}`,
  );

const leaveGroupService = (conversationId: number) =>
  instance.delete<LeaveOrRemoveResponse>(`/manager/conversations/${conversationId}/leave`);

const deleteGroupService = (conversationId: number) =>
  instance.delete<LeaveOrRemoveResponse>(`/manager/conversations/${conversationId}`);

const conversationService = {
  getConversationsService,
  searchBranchMembersService,
  createOrGetDirectConversationService,
  createGroupConversationService,
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
