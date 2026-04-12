import Joi from "joi";
import { amountField } from "./common/walletField.js";
import { idParams } from "./common/numberField.js";
import { emailField, otpCodeField } from "./common/authFields.js";

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

export const walletCallbackSchema = {
  body: Joi.object({
    vnp_Amount: Joi.string().pattern(/^\d+$/).required().messages({
      "string.empty": "Amount is required",
      "string.pattern.base": "Amount must be a number string",
      "any.required": "Amount is required",
    }),
    vnp_BankCode: Joi.string().trim().required().messages({
      "string.empty": "Bank code is required",
      "any.required": "Bank code is required",
    }),
    vnp_BankTranNo: Joi.string().trim().required().messages({
      "string.empty": "Bank transaction number is required",
      "any.required": "Bank transaction number is required",
    }),
    vnp_CardType: Joi.string().trim().required().messages({
      "string.empty": "Card type is required",
      "any.required": "Card type is required",
    }),
    vnp_OrderInfo: Joi.string().trim().required().messages({
      "string.empty": "Order info is required",
      "any.required": "Order info is required",
    }),
    vnp_PayDate: Joi.string()
      .pattern(/^\d{14}$/)
      .required()
      .messages({
        "string.empty": "Pay date is required",
        "string.pattern.base": "Pay date must be format yyyyMMddHHmmss",
        "any.required": "Pay date is required",
      }),
    vnp_ResponseCode: Joi.string().length(2).required().messages({
      "string.length": "Response code must be 2 characters",
      "any.required": "Response code is required",
    }),
    vnp_TmnCode: Joi.string().required().messages({
      "string.empty": "Terminal code is required",
      "any.required": "Terminal code is required",
    }),
    vnp_TransactionNo: Joi.string().pattern(/^\d+$/).required().messages({
      "string.pattern.base": "Transaction number must be digits",
      "any.required": "Transaction number is required",
    }),
    vnp_TransactionStatus: Joi.string().length(2).required().messages({
      "string.length": "Transaction status must be 2 characters",
      "any.required": "Transaction status is required",
    }),
    vnp_TxnRef: Joi.string().required().messages({
      "string.empty": "Transaction reference is required",
      "any.required": "Transaction reference is required",
    }),
    vnp_SecureHash: Joi.string().required().messages({
      "string.empty": "Secure hash is required",
      "any.required": "Secure hash is required",
    }),
  }),
};

export const walletWithdrawConfirmSchema = {
  body: Joi.object({
    withdrawRequestId: idParams("withdrawRequestId"),
    otpCode: otpCodeField,
    email: emailField,
  }),
};
