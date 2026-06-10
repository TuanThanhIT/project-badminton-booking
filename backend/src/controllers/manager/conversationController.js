import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import conversationService from "../../services/manager/conversationService.js";

const searchBranchMembersController = asyncHandler(async (req, res) => {
  const data = { managerId: req.user.id, query: req.query };
  const users = await conversationService.searchBranchMembersService(data);
  return res.status(200).json(new SuccessResponse("Lấy danh sách thành viên thành công", users));
});

const getConversationsController = asyncHandler(async (req, res) => {
  const conversations = await conversationService.getConversationsService({ managerId: req.user.id });
  return res.status(200).json(new SuccessResponse("Lấy danh sách hội thoại thành công", conversations));
});

const createOrGetDirectConversationController = asyncHandler(async (req, res) => {
  const data = { managerId: req.user.id, targetUserId: req.params.targetUserId };
  const conversation = await conversationService.createOrGetDirectConversationService(data);
  return res.status(200).json(new SuccessResponse("Tạo/Lấy hội thoại thành công", conversation));
});

const createGroupConversationController = asyncHandler(async (req, res) => {
  const data = { managerId: req.user.id, ...req.body };
  const conversation = await conversationService.createGroupConversationService(data);
  return res.status(201).json(new SuccessResponse("Tạo nhóm thành công", conversation));
});

const getMessagesController = asyncHandler(async (req, res) => {
  const data = { managerId: req.user.id, query: req.query, conversationId: req.params.conversationId };
  const messages = await conversationService.getMessagesService(data);
  return res.status(200).json(new SuccessResponse("Lấy tin nhắn thành công", messages));
});

const sendMessageController = asyncHandler(async (req, res) => {
  const data = { managerId: req.user.id, ...req.body, conversationId: req.params.conversationId };
  const message = await conversationService.sendMessageService(data);
  return res.status(201).json(new SuccessResponse("Gửi tin nhắn thành công", message));
});

const uploadChatAttachmentController = asyncHandler(async (req, res) => {
  const data = {
    managerId: req.user.id,
    conversationId: req.params.conversationId,
    ...req.body,
    file: req.file,
  };
  const message = await conversationService.uploadAndSendMessageService(data);
  return res.status(201).json(new SuccessResponse("Gửi file thành công", message));
});

const recallMessageController = asyncHandler(async (req, res) => {
  const data = {
    managerId: req.user.id,
    conversationId: req.params.conversationId,
    messageId: req.params.messageId,
  };
  const result = await conversationService.recallMessageService(data);
  return res.status(200).json(new SuccessResponse("Đã thu hồi tin nhắn", result));
});

const addMembersController = asyncHandler(async (req, res) => {
  const data = { managerId: req.user.id, ...req.body, conversationId: req.params.conversationId };
  const conversation = await conversationService.addMembersToGroupService(data);
  return res.status(200).json(new SuccessResponse("Đã thêm thành viên", conversation));
});

const removeMemberController = asyncHandler(async (req, res) => {
  const data = {
    managerId: req.user.id,
    conversationId: req.params.conversationId,
    targetUserId: req.params.userId,
  };
  const result = await conversationService.removeMemberFromGroupService(data);
  return res.status(200).json(new SuccessResponse("Đã xóa thành viên", result));
});

const leaveGroupController = asyncHandler(async (req, res) => {
  const data = { managerId: req.user.id, conversationId: req.params.conversationId };
  const result = await conversationService.leaveGroupService(data);
  return res.status(200).json(new SuccessResponse("Bạn đã rời nhóm", result));
});

const deleteGroupConversationController = asyncHandler(async (req, res) => {
  const data = { managerId: req.user.id, conversationId: req.params.conversationId };
  const result = await conversationService.deleteGroupConversationService(data);
  return res.status(200).json(new SuccessResponse("Đã xóa nhóm", result));
});

const conversationController = {
  searchBranchMembersController,
  getConversationsController,
  createOrGetDirectConversationController,
  createGroupConversationController,
  getMessagesController,
  sendMessageController,
  uploadChatAttachmentController,
  recallMessageController,
  addMembersController,
  removeMemberController,
  leaveGroupController,
  deleteGroupConversationController,
};

export default conversationController;
