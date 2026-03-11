import Joi from "joi";
import {
  emailField,
  otpCodeField,
  passwordField,
  usernameField,
} from "./common/authFields.js";

export const handleRegisterSchema = {
  body: Joi.object({
    username: usernameField,
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

export const sendOtpSchema = {
  body: Joi.object({
    email: emailField,
  }),
};

export const handleLoginSchema = {
  body: Joi.object({
    username: usernameField,
    password: passwordField,
  }),
};
