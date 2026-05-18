import Joi from "joi";
import {
  DISCOUNT_TARGET_TYPE,
  DISCOUNT_TYPE,
} from "../../constants/discountConstant.js";

export const codeField = Joi.string()
  .trim()
  .uppercase()
  .min(3)
  .max(30)
  .required()
  .messages({
    "string.base": "Discount code must be a string",
    "string.empty": "Discount code must not be empty",
    "string.min": "Discount code must be at least 3 characters",
    "string.max": "Discount code must be at most 30 characters",
    "any.required": "Discount code is required",
  });

export const orderAmountField = Joi.number()
  .positive()
  .precision(2)
  .required()
  .messages({
    "number.base": "Order amount must be a number",
    "number.positive": "Order amount must be greater than 0",
    "any.required": "Order amount is required",
  });

export const bookingAmountField = Joi.number()
  .positive()
  .precision(2)
  .required()
  .messages({
    "number.base": "Booking amount must be a number",
    "number.positive": "Booking amount must be greater than 0",
    "any.required": "Booking amount is required",
  });

export const typeField = Joi.string()
  .valid(...Object.values(DISCOUNT_TYPE))
  .messages({
    "any.required": "Discount type is required",
    "any.only": "Invalid discount type",
  });

export const targetTypeField = Joi.string()
  .valid(...Object.values(DISCOUNT_TARGET_TYPE))
  .optional()
  .messages({
    "any.only": "Invalid discount target type",
  });

export const valueField = Joi.number().positive().required().messages({
  "any.required": "Discount value is required",
  "number.positive": "Discount value must be greater than 0",
});
export const startDateField = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .messages({
    "any.required": "Start date is required",
    "string.pattern.base": "Start date must be YYYY-MM-DD",
  });

export const endDateField = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .messages({
    "any.required": "End date is required",
    "string.pattern.base": "End date must be YYYY-MM-DD",
  });
