import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import chatUpload from "../../middlewares/uploadChat.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import conversationController from "../../controllers/manager/conversationController.js";
import {
  addMembersSchema,
  conversationIdParamSchema,
  createGroupSchema,
  directConversationSchema,
  getMessagesSchema,
  recallMessageSchema,
  removeMemberSchema,
  sendMessageSchema,
  uploadChatAttachmentSchema,
} from "../../validations/conversationValidation.js";

const conversationRoute = express.Router();

const initConversationRouteManager = (app) => {
  conversationRoute.get(
    "/members/search",
    auth,
    authorize(ROLE_NAME.MANAGER),
    conversationController.searchBranchMembersController,
  );

  conversationRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.MANAGER),
    conversationController.getConversationsController,
  );

  conversationRoute.post(
    "/direct/:targetUserId",
    auth,
    authorize(ROLE_NAME.MANAGER),
    validate(directConversationSchema),
    conversationController.createOrGetDirectConversationController,
  );

  conversationRoute.post(
    "/group",
    auth,
    authorize(ROLE_NAME.MANAGER),
    validate(createGroupSchema),
    conversationController.createGroupConversationController,
  );

  conversationRoute.post(
    "/:conversationId/attachments",
    auth,
    authorize(ROLE_NAME.MANAGER),
    validate(uploadChatAttachmentSchema),
    chatUpload.single("file"),
    conversationController.uploadChatAttachmentController,
  );

  conversationRoute.patch(
    "/:conversationId/messages/:messageId/recall",
    auth,
    authorize(ROLE_NAME.MANAGER),
    validate(recallMessageSchema),
    conversationController.recallMessageController,
  );

  conversationRoute.post(
    "/:conversationId/members",
    auth,
    authorize(ROLE_NAME.MANAGER),
    validate(addMembersSchema),
    conversationController.addMembersController,
  );

  conversationRoute.delete(
    "/:conversationId/members/:userId",
    auth,
    authorize(ROLE_NAME.MANAGER),
    validate(removeMemberSchema),
    conversationController.removeMemberController,
  );

  conversationRoute.delete(
    "/:conversationId/leave",
    auth,
    authorize(ROLE_NAME.MANAGER),
    validate(conversationIdParamSchema),
    conversationController.leaveGroupController,
  );

  conversationRoute.delete(
    "/:conversationId",
    auth,
    authorize(ROLE_NAME.MANAGER),
    validate(conversationIdParamSchema),
    conversationController.deleteGroupConversationController,
  );

  conversationRoute.get(
    "/:conversationId/messages",
    auth,
    authorize(ROLE_NAME.MANAGER),
    validate(getMessagesSchema),
    conversationController.getMessagesController,
  );

  conversationRoute.post(
    "/:conversationId/messages",
    auth,
    authorize(ROLE_NAME.MANAGER),
    validate(sendMessageSchema),
    conversationController.sendMessageController,
  );

  app.use("/manager/conversations", conversationRoute);
};

export default initConversationRouteManager;
