import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import messageService from "../../services/user/messageService.js";

const getMessagesController = asyncHandler(async (req, res) => {
  const data = {
    User: req.user,
    query: req.query,
    conversationId: req.params.conversationId,
  };
  const messages = await messageService.getMessagesService(data);
  return res.status(200).json(new SuccessResponse("Lấy tin nhắn thành công", messages));
});

const sendMessageController = asyncHandler(async (req, res) => {
  const data = { User: req.user, ...req.body, conversationId: req.params.conversationId };
  const message = await messageService.sendMessageService(data);
  return res.status(201).json(new SuccessResponse("Gửi tin nhắn thành công", message));
});

const uploadChatAttachmentController = asyncHandler(async (req, res) => {
  const data = { User: req.user, conversationId: req.params.conversationId, ...req.body, file: req.file };
  const message = await messageService.uploadAndSendMessageService(data);
  return res.status(201).json(new SuccessResponse("Gửi file thành công", message));
});

const recallMessageController = asyncHandler(async (req, res) => {
  const data = { User: req.user, conversationId: req.params.conversationId, messageId: req.params.messageId };
  const result = await messageService.recallMessageService(data);
  return res.status(200).json(new SuccessResponse("Đã thu hồi tin nhắn", result));
});

const messageController = {
  getMessagesController,
  sendMessageController,
  uploadChatAttachmentController,
  recallMessageController,
};

export default messageController;
