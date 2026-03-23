import Joi from "joi";
import { POST_TYPE } from "../../constants/postConstant.js";
export const titleField = Joi.string()
  .min(3)
  .max(200)
  .trim()
  .required()
  .messages({
    "string.base": "Tiêu đề phải là chuỗi",
    "string.empty": "Tiêu đề không được để trống",
    "string.min": "Tiêu đề tối thiểu 3 ký tự",
    "string.max": "Tiêu đề tối đa 200 ký tự",
    "any.required": "Tiêu đề là bắt buộc",
  });
export const contentField = Joi.string()
  .max(2000)
  .allow("", null)
  .messages({
    "string.max": "Mô tả tối đa 2000 ký tự",
  });
export const postTypeField = Joi.string()
  .valid(...Object.values(POST_TYPE))
  .required()
  .messages({
    "any.only": "Loại bài không hợp lệ",
    "any.required": "Loại bài là bắt buộc",
  });
export const formDataField = Joi.object()
  .unknown(true)
  .allow(null);
export const idParamField = Joi.number()
  .integer()
  .min(1)
  .required()
  .messages({
    "number.base": "ID bài đăng không hợp lệ",
    "any.required": "ID bài đăng là bắt buộc",
  });