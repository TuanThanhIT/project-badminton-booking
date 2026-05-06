import Joi from "joi";
import { idParams } from "./common/numberField.js";
import { limitField ,pageField} from "./common/paginationFields.js";
import { mediaUrlField, messageBodyField, messageTypeField, replyToIdField, conversationNameField, userIdsField, nicknameField } from "./common/conversationFields.js";
export const directConversationSchema = {
  params: Joi.object({
    targetUserId: idParams("targetUserId"),
  }),
};

export const getMessagesSchema = {
  params: Joi.object({
    conversationId: idParams("conversationId"),
  }),
  query: Joi.object({
    page: pageField,
    limit: limitField
  }),
};

export const sendMessageSchema = {
  params: Joi.object({
    conversationId: idParams("conversationId"),
  }),
  body: Joi.object({
    body: messageBodyField,
    mediaUrl: mediaUrlField,
    type: messageTypeField,
    replyToId: replyToIdField,
  }),
};

export const createGroupSchema = {
  body: Joi.object({
    name: conversationNameField,
    userIds: userIdsField,
  }),
};

export const updateDirectNicknameSchema = {
  params: Joi.object({
    conversationId: idParams("conversationId"),
  }),
  body: Joi.object({
    nickname: nicknameField,
  }),
};

export const conversationIdParamSchema = {
  params: Joi.object({
    conversationId: idParams("conversationId"),
  }),
};

export const recallMessageSchema = {
  params: Joi.object({
    conversationId: idParams("conversationId"),
    messageId: idParams("messageId"),
  }),
};

export const addMembersSchema = {
  params: Joi.object({
    conversationId: idParams("conversationId"),
  }),
  body: Joi.object({
    userIds: userIdsField,
  }),
};

export const removeMemberSchema = {
  params: Joi.object({
    conversationId: idParams("conversationId"),
    userId: idParams("userId"),
  }),
};

export const uploadChatAttachmentSchema = {
  params: Joi.object({
    conversationId: idParams("conversationId"),
  }),
};
