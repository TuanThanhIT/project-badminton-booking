import Joi from "joi";
import {
  emailField,
  otpCodeField,
  passwordField,
} from "./common/authSchema.js";

export const createUserSchema = {
  body: Joi.object({
    username: Joi.string()
      .min(3)
      .max(50)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .required()
      .messages({
        "string.base": "Username must be a string",
        "string.empty": "Username cannot be empty",
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username must be at most 50 characters",
        "string.pattern.base":
          "Username can only contain letters, numbers and underscore",
        "any.required": "Username is required",
      }),
    email: emailField,
    password: passwordField,
  }),
};

export const verifyOtpSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "string.empty": "Email cannot be empty",
      "any.required": "Email is required",
    }),
    otpCode: otpCodeField,
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    email: emailField,
    otpCode: otpCodeField,
    newPassword: passwordField,
  }),
};

export const sendVerifyOtpSchema = {
  body: Joi.object({
    email: emailField,
  }),
};
