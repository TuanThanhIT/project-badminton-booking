import Joi from "joi";
import { idParams } from "./common/numberField.js";

const genderField = Joi.string().valid("male", "female", "other").messages({
  "string.base": "Giới tính phải là chuỗi.",
  "any.only": "Giới tính không hợp lệ.",
});

const dateField = Joi.date().less("now").messages({
  "date.base": "Ngày sinh không hợp lệ.",
  "date.less": "Ngày sinh phải nhỏ hơn hiện tại.",
});

const phoneField = Joi.string()
  .trim()
  .pattern(/^[0-9]{9,11}$/)
  .messages({
    "string.base": "Số điện thoại phải là chuỗi.",
    "string.pattern.base": "Số điện thoại phải gồm 9 đến 11 chữ số.",
  });

export const updateMyProfileSchema = {
  body: Joi.object({
    fullName: Joi.string().trim().min(2).max(255).messages({
      "string.base": "Họ tên phải là chuỗi.",
      "string.min": "Họ tên tối thiểu 2 ký tự.",
      "string.max": "Họ tên tối đa 255 ký tự.",
    }),
    dob: dateField.allow(null),
    gender: genderField.allow(null),
    address: Joi.string().trim().max(255).messages({
      "string.base": "Địa chỉ phải là chuỗi.",
      "string.max": "Địa chỉ tối đa 255 ký tự.",
    }),
    phoneNumber: phoneField,
    avatar: Joi.string().uri().max(1000).allow(null, "").messages({
      "string.base": "Avatar phải là chuỗi.",
      "string.uri": "Avatar phải là URL hợp lệ.",
      "string.max": "Avatar tối đa 1000 ký tự.",
    }),
  })
    .min(1)
    .messages({
      "object.min": "Vui lòng cung cấp ít nhất 1 trường để cập nhật.",
    }),
};

export const getPublicProfileSchema = {
  params: Joi.object({
    userId: idParams("userId"),
  }),
};
