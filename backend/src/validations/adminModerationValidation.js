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

const dateField = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .messages({
    "string.pattern.base": "Ngày phải có định dạng YYYY-MM-DD",
  });

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
    startDate: dateField,
    endDate: dateField,
  }).custom((value, helpers) => {
    const { startDate, endDate } = value;
    if (startDate && endDate && startDate > endDate) {
      return helpers.message("Ngày bắt đầu không được sau ngày kết thúc");
    }
    return value;
  }),
};

export const postAnalyticsQuerySchema = {
  query: Joi.object({
    startDate: dateField,
    endDate: dateField,
  }).custom((value, helpers) => {
    const { startDate, endDate } = value;
    if (startDate && endDate && startDate > endDate) {
      return helpers.message("Ngày bắt đầu không được sau ngày kết thúc");
    }
    return value;
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
