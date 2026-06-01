import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import conversationService from "../../services/user/conversationService.js";

const getConversationsController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id };
  const conversations = await conversationService.getConversationsService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách hội thoại thành công", conversations));
});

const createOrGetDirectConversationController = asyncHandler(async (req, res) => {
  const data = {
    userId: Number(req.user.id),
    targetUserId: Number(req.params.targetUserId),
  };
  const conversation = await conversationService.createOrGetDirectConversationService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Tạo/Lấy hội thoại thành công", conversation));
});

const createGroupConversationController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id, ...req.body };
  const conversation = await conversationService.createGroupConversationService(data);
  return res.status(201).json(new SuccessResponse("Tạo nhóm thành công", conversation));
});

const updateDirectNicknameController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id, ...req.body, conversationId: req.params.conversationId };
  const conversation = await conversationService.updateDirectNicknameService(data);
  return res.status(200).json(new SuccessResponse("Đổi biệt danh thành công", conversation));
});

const addMembersController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id, ...req.body, conversationId: req.params.conversationId };
  const conversation = await conversationService.addMembersToGroupService(data);
  return res.status(200).json(new SuccessResponse("Đã thêm thành viên", conversation));
});

const removeMemberController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id, conversationId: req.params.conversationId, targetUserId: req.params.userId };
  const result = await conversationService.removeMemberFromGroupService(data);
  if (result?.deleted) {
    return res.status(200).json(new SuccessResponse("Cuộc trò chuyện đã kết thúc", result));
  }
  return res.status(200).json(new SuccessResponse("Đã xóa thành viên", result));
});

const leaveGroupController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id, conversationId: req.params.conversationId };
  const result = await conversationService.leaveGroupService(data);
  if (result?.deleted) {
    return res.status(200).json(new SuccessResponse("Bạn đã rời nhóm", result));
  }
  return res.status(200).json(new SuccessResponse("Bạn đã rời nhóm", result));
});

const deleteGroupConversationController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id, conversationId: req.params.conversationId };
  const result = await conversationService.deleteGroupConversationService(data);
  return res.status(200).json(new SuccessResponse("Đã xóa nhóm", result));
});

const conversationController = {
  getConversationsController,
  createOrGetDirectConversationController,
  createGroupConversationController,
  updateDirectNicknameController,
  addMembersController,
  removeMemberController,
  leaveGroupController,
  deleteGroupConversationController,
};

export default conversationController;
