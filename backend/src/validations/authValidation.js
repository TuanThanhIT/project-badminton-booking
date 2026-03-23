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
  }).required(),
};

export const verifyOtpSchema = {
  body: Joi.object({
    email: emailField,
    otpCode: otpCodeField,
  }).required(),
};

export const resetPasswordSchema = {
  body: Joi.object({
    email: emailField,
    otpCode: otpCodeField,
    newPassword: passwordField,
  }).required(),
};

export const sendOtpSchema = {
  body: Joi.object({
    email: emailField,
  }).required(),
};

export const handleLoginSchema = {
  body: Joi.object({
    username: usernameField,
    password: passwordField,
  }).required(),
};
