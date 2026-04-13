import Joi from "joi";
import {
  emailField,
  otpCodeField,
  passwordField,
  usernameField,
} from "./common/authFields.js";
import { OTP_TYPE } from "../constants/userConstant.js";

export const handleRegisterSchema = {
  body: Joi.object({
    username: usernameField,
    email: emailField,
    password: passwordField,
  }),
};

export const verifyOtpSchema = {
  body: Joi.object({
    email: emailField,
    otpCode: otpCodeField,
  }),
};

export const verifyResetOtpSchema = {
  body: Joi.object({
    email: emailField,
    otpCode: otpCodeField,
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    resetToken: Joi.string().length(64).hex().required().messages({
      "string.length": "Reset token is invalid",
      "string.hex": "Reset token must be a valid hex string",
      "string.empty": "Reset token cannot be empty",
      "any.required": "Reset token is required",
    }),
    newPassword: passwordField,
  }),
};

export const sendOtpSchema = {
  body: Joi.object({
    email: emailField,
    type: Joi.string()
      .valid(...Object.values(OTP_TYPE))
      .messages({
        "any.only": "Invalid otp type",
        "any.required": "Otp type is required",
        "string.base": "Otp type must be a string",
      }),
  }),
};

export const handleLoginSchema = {
  body: Joi.object({
    username: usernameField,
    password: passwordField,
  }),
};
