import Joi from "joi";

export const emailField = Joi.string().email().required().messages({
  "string.email": "Invalid email format",
  "string.empty": "Email cannot be empty",
  "any.required": "Email is required",
});

export const passwordField = Joi.string().min(6).max(255).required().messages({
  "string.min": "Password must be at least 6 characters",
  "string.empty": "Password cannot be empty",
  "any.required": "Password is required",
});

export const otpCodeField = Joi.string()
  .length(6)
  .pattern(/^[0-9]+$/)
  .required()
  .messages({
    "string.length": "OTP must be exactly 6 digits",
    "string.pattern.base": "OTP must contain only numbers",
    "string.empty": "OTP cannot be empty",
    "any.required": "OTP is required",
  });
