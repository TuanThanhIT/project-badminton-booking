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

export const passwordField = Joi.string()
  .min(8)
  .max(255)
  .pattern(/[A-Z]/, "uppercase") // ít nhất 1 chữ hoa
  .pattern(/[a-z]/, "lowercase") // ít nhất 1 chữ thường
  .pattern(/[0-9]/, "number") // ít nhất 1 số
  .pattern(/[^A-Za-z0-9]/, "special") // ít nhất 1 ký tự đặc biệt
  .required()
  .messages({
    "string.min": "Password phải có ít nhất 8 ký tự",
    "string.max": "Password không được vượt quá 255 ký tự",
    "string.empty": "Password không được để trống",
    "any.required": "Password là bắt buộc",
    "string.pattern.name":
      "Password phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
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
