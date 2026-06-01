import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import conversationService from "../../services/manager/conversationService.js";

const searchBranchMembersController = asyncHandler(async (req, res) => {
  const data = { managerId: req.user.id, query: req.query };
  const users = await conversationService.searchBranchMembersService(data);
  return res.status(200).json(new SuccessResponse("Lay danh sach thanh vien thanh cong", users));
});

const getConversationsController = asyncHandler(async (req, res) => {
  const conversations = await conversationService.getConversationsService({ managerId: req.user.id });
  return res.status(200).json(new SuccessResponse("Lay danh sach hoi thoai thanh cong", conversations));
});

const createOrGetDirectConversationController = asyncHandler(async (req, res) => {
  const data = { managerId: req.user.id, targetUserId: req.params.targetUserId };
  const conversation = await conversationService.createOrGetDirectConversationService(data);
  return res.status(200).json(new SuccessResponse("Tao/Lay hoi thoai thanh cong", conversation));
});

const createGroupConversationController = asyncHandler(async (req, res) => {
  const data = { managerId: req.user.id, ...req.body };
  const conversation = await conversationService.createGroupConversationService(data);
  return res.status(201).json(new SuccessResponse("Tao nhom thanh cong", conversation));
});

const getMessagesController = asyncHandler(async (req, res) => {
  const data = { managerId: req.user.id, query: req.query, conversationId: req.params.conversationId };
  const messages = await conversationService.getMessagesService(data);
  return res.status(200).json(new SuccessResponse("Lay tin nhan thanh cong", messages));
});

const sendMessageController = asyncHandler(async (req, res) => {
  const data = { managerId: req.user.id, ...req.body, conversationId: req.params.conversationId };
  const message = await conversationService.sendMessageService(data);
  return res.status(201).json(new SuccessResponse("Gui tin nhan thanh cong", message));
});

const uploadChatAttachmentController = asyncHandler(async (req, res) => {
  const data = {
    managerId: req.user.id,
    conversationId: req.params.conversationId,
    ...req.body,
    file: req.file,
  };
  const message = await conversationService.uploadAndSendMessageService(data);
  return res.status(201).json(new SuccessResponse("Gui file thanh cong", message));
});

const recallMessageController = asyncHandler(async (req, res) => {
  const data = {
    managerId: req.user.id,
    conversationId: req.params.conversationId,
    messageId: req.params.messageId,
  };
  const result = await conversationService.recallMessageService(data);
  return res.status(200).json(new SuccessResponse("Da thu hoi tin nhan", result));
});

const addMembersController = asyncHandler(async (req, res) => {
  const data = { managerId: req.user.id, ...req.body, conversationId: req.params.conversationId };
  const conversation = await conversationService.addMembersToGroupService(data);
  return res.status(200).json(new SuccessResponse("Da them thanh vien", conversation));
});

const removeMemberController = asyncHandler(async (req, res) => {
  const data = {
    managerId: req.user.id,
    conversationId: req.params.conversationId,
    targetUserId: req.params.userId,
  };
  const result = await conversationService.removeMemberFromGroupService(data);
  return res.status(200).json(new SuccessResponse("Da xoa thanh vien", result));
});

const leaveGroupController = asyncHandler(async (req, res) => {
  const data = { managerId: req.user.id, conversationId: req.params.conversationId };
  const result = await conversationService.leaveGroupService(data);
  return res.status(200).json(new SuccessResponse("Ban da roi nhom", result));
});

const deleteGroupConversationController = asyncHandler(async (req, res) => {
  const data = { managerId: req.user.id, conversationId: req.params.conversationId };
  const result = await conversationService.deleteGroupConversationService(data);
  return res.status(200).json(new SuccessResponse("Da xoa nhom", result));
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
