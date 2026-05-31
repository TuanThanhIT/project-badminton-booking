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
import { ROLE_NAME } from "../../constants/userConstant.js";

const conversationRoute = express.Router();

const initConversationRoute = (app) => {
  conversationRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.USER),
    conversationController.getConversationsController,
  );

  conversationRoute.post(
    "/direct/:targetUserId",
    auth,
    authorize(ROLE_NAME.USER),
    validate(directConversationSchema),
    conversationController.createOrGetDirectConversationController,
  );

  conversationRoute.post(
    "/group",
    auth,
    authorize(ROLE_NAME.USER),
    validate(createGroupSchema),
    conversationController.createGroupConversationController,
  );

  conversationRoute.patch(
    "/:conversationId/nickname",
    auth,
    authorize(ROLE_NAME.USER),
    validate(updateDirectNicknameSchema),
    conversationController.updateDirectNicknameController,
  );

  conversationRoute.post(
    "/:conversationId/attachments",
    auth,
    authorize(ROLE_NAME.USER),
    validate(uploadChatAttachmentSchema),
    chatUpload.single("file"),
    messageController.uploadChatAttachmentController,
  );

  conversationRoute.patch(
    "/:conversationId/messages/:messageId/recall",
    auth,
    authorize(ROLE_NAME.USER),
    validate(recallMessageSchema),
    messageController.recallMessageController,
  );

  conversationRoute.post(
    "/:conversationId/members",
    auth,
    authorize(ROLE_NAME.USER),
    validate(addMembersSchema),
    conversationController.addMembersController,
  );

  conversationRoute.delete(
    "/:conversationId/members/:userId",
    auth,
    authorize(ROLE_NAME.USER),
    validate(removeMemberSchema),
    conversationController.removeMemberController,
  );

  conversationRoute.delete(
    "/:conversationId/leave",
    auth,
    authorize(ROLE_NAME.USER),
    validate(conversationIdParamSchema),
    conversationController.leaveGroupController,
  );

  conversationRoute.delete(
    "/:conversationId",
    auth,
    authorize(ROLE_NAME.USER),
    validate(conversationIdParamSchema),
    conversationController.deleteGroupConversationController,
  );

  conversationRoute.get(
    "/:conversationId/messages",
    auth,
    authorize(ROLE_NAME.USER),
    validate(getMessagesSchema),
    messageController.getMessagesController,
  );

  conversationRoute.post(
    "/:conversationId/messages",
    auth,
    authorize(ROLE_NAME.USER),
    validate(sendMessageSchema),
    messageController.sendMessageController,
  );

  app.use("/user/conversations", conversationRoute);
};

export default initConversationRoute;
