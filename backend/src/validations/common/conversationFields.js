import Joi from "joi";
import { idParams } from "./numberField.js"; 

export const conversationNameField = Joi.string()
  .trim()
  .min(1)
  .max(120)
  .required()
  .messages({
    "string.base": "Tên nhóm phải là chuỗi.",
    "string.empty": "Tên nhóm không được để trống.",
    "string.min": "Tên nhóm không được để trống.",
    "string.max": "Tên nhóm tối đa 120 ký tự.",
    "any.required": "Tên nhóm là bắt buộc.",
  });

export const nicknameField = Joi.string()
  .trim()
  .min(1)
  .max(120)
  .required()
  .messages({
    "string.base": "Biệt danh phải là chuỗi.",
    "string.empty": "Biệt danh không được để trống.",
    "string.min": "Biệt danh không được để trống.",
    "string.max": "Biệt danh tối đa 120 ký tự.",
    "any.required": "Biệt danh là bắt buộc.",
  });

export const userIdsField = Joi.array()
  .items(idParams("userId"))
  .min(1)
  .required()
  .messages({
    "array.base": "Danh sách thành viên phải là mảng.",
    "array.min": "Phải chọn ít nhất 1 thành viên.",
    "any.required": "Danh sách thành viên là bắt buộc.",
  });

export const messageBodyField = Joi.string()
  .trim()
  .max(5000)
  .allow("")
  .optional()
  .messages({
    "string.base": "Nội dung tin nhắn phải là chuỗi.",
    "string.max": "Nội dung tin nhắn tối đa 5000 ký tự.",
  });

export const mediaUrlField = Joi.string()
  .trim()
  .max(2048)
  .allow("", null)
  .optional()
  .messages({
    "string.base": "Đường dẫn tệp không hợp lệ.",
    "string.max": "Đường dẫn tệp quá dài.",
  });

export const messageTypeField = Joi.string()
  .valid("Text", "Image", "File")
  .optional()
  .messages({
    "any.only": "Loại tin nhắn không hợp lệ.",
  });