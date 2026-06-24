import Joi from "joi";
import { idParams } from "./common/numberField.js";
import { POST_REACTION } from "../constants/postConstant.js";
import { COMMENT_REPORT_REASON } from "../constants/commentReportConstant.js";

const postIdParamSchema = Joi.object({
  postId: idParams("postId"),
});

const commentIdParamSchema = Joi.object({
  commentId: idParams("commentId"),
});

const commentContentField = Joi.string().trim().min(1).max(2000).required().messages({
  "string.base": "Nội dung bình luận phải là chuỗi",
  "string.empty": "Nội dung bình luận không được để trống",
  "string.min": "Nội dung bình luận không được để trống",
  "string.max": "Nội dung bình luận tối đa 2000 ký tự",
  "any.required": "Nội dung bình luận là bắt buộc",
});

const parentIdField = Joi.number().integer().positive().allow(null).optional().messages({
  "number.base": "parentId must be a number",
  "number.integer": "parentId must be an integer",
  "number.positive": "parentId must be a positive number",
});

const repostContentField = Joi.string().trim().max(2000).allow("", null).optional().messages({
  "string.base": "Nội dung chia sẻ phải là chuỗi",
  "string.max": "Nội dung chia sẻ tối đa 2000 ký tự",
});

export const toggleLikeSchema = {
  params: postIdParamSchema,
  body: Joi.object({
    reactionType: Joi.string()
      .valid(...Object.values(POST_REACTION))
      .default(POST_REACTION.LIKE)
      .optional(),
  }),
};

export const createCommentSchema = {
  params: postIdParamSchema,
  body: Joi.object({
    content: commentContentField,
    parentId: parentIdField,
  }),
};

export const getCommentsSchema = {
  params: postIdParamSchema,
};

export const createRepostSchema = {
  params: postIdParamSchema,
  body: Joi.object({
    content: repostContentField,
  }),
};

export const reportCommentSchema = {
  params: commentIdParamSchema,
  body: Joi.object({
    reason: Joi.string()
      .valid(...Object.values(COMMENT_REPORT_REASON))
      .required()
      .messages({
        "any.only": "Lý do báo cáo bình luận không hợp lệ",
        "any.required": "Lý do báo cáo bình luận là bắt buộc",
      }),
    description: Joi.string().trim().max(1000).allow("", null).optional().messages({
      "string.max": "Mô tả báo cáo tối đa 1000 ký tự",
    }),
  }),
};

export const deleteCommentSchema = {
  params: commentIdParamSchema,
};

