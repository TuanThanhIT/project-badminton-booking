import Joi from "joi";

export const usernameField = Joi.string()
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
  });

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

export const tokenField = Joi.string().min(10).required().messages({
  "string.min": "Reset token is invalid",
  "string.empty": "Reset token cannot be empty",
  "any.required": "Reset token is required",
});
