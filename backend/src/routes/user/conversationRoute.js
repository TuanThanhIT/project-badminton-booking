import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import chatUpload from "../../middlewares/uploadChat.js";
import conversationController from "../../controllers/user/conversationController.js";
import messageController from "../../controllers/user/messageController.js";
import {
  addMembersSchema,
  conversationIdParamSchema,
  createGroupSchema,
  directConversationSchema,
  getMessagesSchema,
  recallMessageSchema,
  removeMemberSchema,
  sendMessageSchema,
  updateDirectNicknameSchema,
  uploadChatAttachmentSchema,
} from "../../validations/conversationValidation.js";

const conversationRoute = express.Router();

const initConversationRoute = (app) => {
  conversationRoute.get(
    "/",
    auth,
    authorize("User", "Coach"),
    conversationController.getConversationsController,
  );

  conversationRoute.post(
    "/direct/:targetUserId",
    auth,
    authorize("User", "Coach"),
    validate(directConversationSchema),
    conversationController.createOrGetDirectConversationController,
  );

  conversationRoute.post(
    "/group",
    auth,
    authorize("User", "Coach"),
    validate(createGroupSchema),
    conversationController.createGroupConversationController,
  );

  conversationRoute.patch(
    "/:conversationId/nickname",
    auth,
    authorize("User", "Coach"),
    validate(updateDirectNicknameSchema),
    conversationController.updateDirectNicknameController,
  );

  conversationRoute.post(
    "/:conversationId/attachments",
    auth,
    authorize("User", "Coach"),
    validate(uploadChatAttachmentSchema),
    chatUpload.single("file"),
    messageController.uploadChatAttachmentController,
  );

  conversationRoute.patch(
    "/:conversationId/messages/:messageId/recall",
    auth,
    authorize("User", "Coach"),
    validate(recallMessageSchema),
    messageController.recallMessageController,
  );

  conversationRoute.post(
    "/:conversationId/members",
    auth,
    authorize("User", "Coach"),
    validate(addMembersSchema),
    conversationController.addMembersController,
  );

  conversationRoute.delete(
    "/:conversationId/members/:userId",
    auth,
    authorize("User", "Coach"),
    validate(removeMemberSchema),
    conversationController.removeMemberController,
  );

  conversationRoute.delete(
    "/:conversationId/leave",
    auth,
    authorize("User", "Coach"),
    validate(conversationIdParamSchema),
    conversationController.leaveGroupController,
  );

  conversationRoute.delete(
    "/:conversationId",
    auth,
    authorize("User", "Coach"),
    validate(conversationIdParamSchema),
    conversationController.deleteGroupConversationController,
  );

  conversationRoute.get(
    "/:conversationId/messages",
    auth,
    authorize("User", "Coach"),
    validate(getMessagesSchema),
    messageController.getMessagesController,
  );

  conversationRoute.post(
    "/:conversationId/messages",
    auth,
    authorize("User", "Coach"),
    validate(sendMessageSchema),
    messageController.sendMessageController,
  );

  app.use("/user/conversations", conversationRoute);
};

export default initConversationRoute;
