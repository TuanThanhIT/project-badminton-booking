import Joi from "joi";
import { dateField, keywordField } from "./common/searchFields.js";
import { idParams, quantityField } from "./common/numberField.js";
import { noteField } from "./common/bookingFields.js";
import { timeField } from "./common/shiftFields.js";
import { PAYMENT_OFFLINE_METHOD_STATUS } from "../constants/paymentConstant.js";

const courtItemSchema = Joi.object({
  courtId: idParams("courtId"),
  playDate: dateField.required(),
  startTime: timeField.required(),
  endTime: timeField.required(),
});

const productItemSchema = Joi.object({
  productVariantId: idParams("productVariantId"),
  quantity: quantityField,
});

const beverageItemSchema = Joi.object({
  beverageId: idParams("beverageId"),
  quantity: quantityField,
});

export const getEmployeeInventorySchema = {
  query: Joi.object({
    keyword: keywordField.allow("").optional(),
  }),
};

export const getEmployeeCourtBoardSchema = {
  query: Joi.object({
    date: dateField.required(),
  }),
};

export const createEmployeeDraftSchema = {
  body: Joi.object({
    nameCustomer: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Tên khách hàng không được để trống",
      "string.min": "Tên khách hàng phải có ít nhất 2 ký tự",
      "string.max": "Tên khách hàng tối đa 100 ký tự",
      "any.required": "Tên khách hàng là bắt buộc",
    }),
    phoneNumber: Joi.string()
      .trim()
      .pattern(/^(0|\+84)[0-9]{9,10}$/)
      .required()
      .messages({
        "string.empty": "Số điện thoại không được để trống",
        "string.pattern.base": "Số điện thoại không hợp lệ",
        "any.required": "Số điện thoại là bắt buộc",
      }),
  }),
};

export const updateEmployeeDraftSchema = {
  params: Joi.object({
    draftId: idParams("draftId"),
  }),
  body: Joi.object({
    nameCustomer: Joi.string().trim().min(2).max(100).optional().messages({
      "string.empty": "Tên khách hàng không được để trống",
      "string.min": "Tên khách hàng phải có ít nhất 2 ký tự",
      "string.max": "Tên khách hàng tối đa 100 ký tự",
    }),
    phoneNumber: Joi.string()
      .trim()
      .pattern(/^(0|\+84)[0-9]{9,10}$/)
      .optional()
      .messages({
        "string.empty": "Số điện thoại không được để trống",
        "string.pattern.base": "Số điện thoại không hợp lệ",
      }),
    note: noteField.allow("").optional(),
    courtItems: Joi.array().items(courtItemSchema).default([]),
    productItems: Joi.array().items(productItemSchema).default([]),
    beverageItems: Joi.array().items(beverageItemSchema).default([]),
  }),
};

export const draftIdParamSchema = {
  params: Joi.object({
    draftId: idParams("draftId"),
  }),
};

export const checkoutEmployeeDraftSchema = {
  params: Joi.object({
    draftId: idParams("draftId"),
  }),
  body: Joi.object({
    paymentMethod: Joi.string()
      .valid(...Object.values(PAYMENT_OFFLINE_METHOD_STATUS))
      .required()
      .messages({
        "any.only": "Phương thức thanh toán phải là CASH, VNPAY hoặc BANK",
        "any.required": "Phương thức thanh toán là bắt buộc",
      }),
  }),
};
