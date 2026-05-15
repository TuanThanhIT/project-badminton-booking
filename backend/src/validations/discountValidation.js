import Joi from "joi";
import {
  bookingAmountField,
  codeField,
  endDateField,
  orderAmountField,
  startDateField,
  targetTypeField,
  typeField,
  valueField,
} from "./common/discountFields.js";
import { limitField, pageField } from "./common/paginationFields.js";
import { idParams } from "./common/numberField.js";

export const applyDiscountSchema = {
  body: Joi.object({
    code: codeField,
    cartId: idParams("cartId"),
  }),
};

export const getDiscountsCheckoutSchema = {
  query: Joi.object({
    amount: orderAmountField,
    targetType: targetTypeField,
  }),
};

export const applyDiscountBookingSchema = {
  body: Joi.object({
    code: codeField,
    bookingAmount: bookingAmountField,
  }),
};

export const updateDiscountSchema = {
  body: Joi.object({
    code: codeField,
  }),
};

export const updateDiscountBookingSchema = {
  body: Joi.object({
    code: codeField,
  }),
};

export const createDiscountBookingSchema = {
  body: Joi.object({
    code: codeField,
    type: typeField.required(),
    value: valueField,
    startDate: startDateField,
    endDate: endDateField,
    minBookingAmount: Joi.number().min(0).required().messages({
      "any.required": "Minimum booking amount is required",
      "number.min": "Minimum booking amount cannot be negative",
    }),
  }),
};

export const getDiscountBookingsSchema = {
  query: Joi.object({
    isUsed: Joi.boolean().truthy("true").falsy("false").optional().messages({
      "boolean.base": "isUsed must be true or false",
    }),
    type: typeField.optional(),
    page: pageField,
    limit: limitField,
  }),
};

export const updateAdDiscountBookingSchema = {
  params: Joi.object({
    discountId: idParams("discountId"),
  }),
};

export const deleteDiscountBookingSchema = {
  params: Joi.object({
    discountId: idParams("discountId"),
  }),
};

export const createDiscountSchema = {
  body: Joi.object({
    code: codeField,
    type: typeField.required(),
    value: valueField,
    startDate: startDateField,
    endDate: endDateField,
    minOrderAmount: Joi.number().min(0).required().messages({
      "any.required": "Minimum order amount is required",
      "number.min": "Minimum order amount cannot be negative",
    }),
  }),
};

export const getDiscountsSchema = {
  query: Joi.object({
    isUsed: Joi.boolean().truthy("true").falsy("false").optional().messages({
      "boolean.base": "isUsed must be true or false",
    }),
    type: typeField.optional(),
    page: pageField,
    limit: limitField,
  }),
};

export const updateAdDiscountSchema = {
  params: Joi.object({
    discountId: idParams("discountId"),
  }),
};

export const deleteDiscountSchema = {
  params: Joi.object({
    discountId: idParams("discountId"),
  }),
};
