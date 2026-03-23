import Joi from "joi";
import { amountField } from "./common/walletField.js";

export const walletDepositSchema = {
  body: Joi.object({
    amount: amountField,
  }),
};

export const walletWithdrawRequestSchema = {
  body: Joi.object({
    amount: amountField,
    bankName: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Bank name is required",
      "string.min": "Bank name must be at least 2 characters",
      "string.max": "Bank name must not exceed 100 characters",
      "any.required": "Bank name is required",
    }),
    bankAccount: Joi.string()
      .trim()
      .pattern(/^[0-9]+$/)
      .min(6)
      .max(50)
      .required()
      .messages({
        "string.empty": "Bank account number is required",
        "string.pattern.base": "Bank account must contain only digits",
        "string.min": "Bank account must be at least 6 digits",
        "string.max": "Bank account must not exceed 50 digits",
        "any.required": "Bank account number is required",
      }),
    accountHolder: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .pattern(/^[A-Za-zÀ-ỹ\s]+$/)
      .required()
      .messages({
        "string.empty": "Account holder name is required",
        "string.pattern.base":
          "Account holder name must contain only letters and spaces",
        "string.min": "Account holder name must be at least 2 characters",
        "string.max": "Account holder name must not exceed 100 characters",
        "any.required": "Account holder name is required",
      }),
  }),
};
