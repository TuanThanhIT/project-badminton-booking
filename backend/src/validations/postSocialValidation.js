import Joi from "joi";
import { idParams } from "./common/numberField.js";

const postIdParamSchema = Joi.object({
  postId: idParams("postId"),
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

