import Joi from "joi";
import { BOOKING_STATUS } from "../../constants/bookingConstant.js";
import {
  PAYMENT_METHOD_STATUS,
  PAYMENT_STATUS,
} from "../../constants/paymentConstant.js";

export const bookingStatusField = Joi.string()
  .valid(...Object.values(BOOKING_STATUS))
  .messages({
    "any.only": "Invalid booking status",
    "string.base": "Booking status must be a string",
  });

export const paymentMethodField = Joi.string()
  .valid(...Object.values(PAYMENT_METHOD_STATUS))
  .required()
  .messages({
    "any.only": "Invalid payment method",
    "any.required": "Payment method is required",
    "string.base": "Payment method must be a string",
  });

export const paymentStatusField = Joi.string()
  .valid(...Object.values(PAYMENT_STATUS))
  .required()
  .messages({
    "any.only": "Invalid payment status",
    "any.required": "Payment status is required",
    "string.base": "Payment status must be a string",
  });

export const codeField = Joi.string().trim().optional().messages({
  "string.base": "Discount code must be a string",
});

export const noteField = Joi.string().trim().max(500).optional().messages({
  "string.base": "Note must be a string",
  "string.max": "Note must be at most 500 characters",
});

export const totalAmountField = Joi.number().positive().required().messages({
  "number.base": "Total amount must be a number",
  "number.positive": "Total amount must be greater than 0",
  "any.required": "Total amount is required",
});

export const paymentAmountField = Joi.number().positive().required().messages({
  "number.base": "Payment amount must be a number",
  "number.positive": "Payment amount must be greater than 0",
  "any.required": "Payment amount is required",
});

export const cancelReasonField = Joi.string()
  .trim()
  .min(5)
  .max(500)
  .required()
  .messages({
    "string.base": "Cancel reason must be a string",
    "string.empty": "Cancel reason must not be empty",
    "string.min": "Cancel reason must be at least 5 characters",
    "string.max": "Cancel reason must be at most 500 characters",
    "any.required": "Cancel reason is required",
  });
