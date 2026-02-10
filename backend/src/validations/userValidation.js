import Joi from "joi";

export const createUserSchema = Joi.object({
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

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email cannot be empty",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).max(255).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password cannot be empty",
    "any.required": "Password is required",
  }),

  roleId: Joi.number().integer().positive().required().messages({
    "number.base": "RoleId must be a number",
    "number.integer": "RoleId must be an integer",
    "number.positive": "RoleId must be greater than 0",
    "any.required": "RoleId is required",
  }),
}).options({
  abortEarly: false, // trả về tất cả lỗi
  allowUnknown: false, // chặn field thừa
});
