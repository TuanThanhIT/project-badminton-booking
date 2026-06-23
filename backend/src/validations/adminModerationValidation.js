import Joi from "joi";
import { MODERATION_LABEL } from "../constants/moderationConstant.js";
import { idParams } from "./common/numberField.js";
import {
  limitField,
  pageField,
} from "./common/paginationFields.js";

const violationLabels = [
  MODERATION_LABEL.SPAM,
  MODERATION_LABEL.UNAUTHORIZED_AD,
  MODERATION_LABEL.OFFENSIVE,
];

export const moderationPostIdSchema = {
  params: Joi.object({
    postId: idParams("postId"),
  }),
};

export const pendingModerationPostsSchema = {
  query: Joi.object({
    page: pageField,
    limit: limitField,
    moderationLabel: Joi.string()
      .valid(...Object.values(MODERATION_LABEL))
      .optional(),
    type: Joi.string()
      .valid("FIND_PLAYER", "FIND_COACH", "CLASS", "TOURNAMENT", "GROUP")
      .optional(),
    keyword: Joi.string().trim().max(200).allow("", null).optional(),
  }),
};

export const approveModerationPostSchema = {
  params: Joi.object({
    postId: idParams("postId"),
  }),
  body: Joi.object({
    reason: Joi.string().trim().max(2000).allow("", null).optional(),
  }),
};

export const rejectModerationPostSchema = {
  params: Joi.object({
    postId: idParams("postId"),
  }),
  body: Joi.object({
    label: Joi.string()
      .valid(...violationLabels)
      .optional(),
    reason: Joi.string().trim().max(2000).allow("", null).optional(),
  }),
};

export const userModerationViolationsSchema = {
  params: Joi.object({
    userId: idParams("userId"),
  }),
  query: Joi.object({
    page: pageField,
    limit: limitField,
  }),
};
