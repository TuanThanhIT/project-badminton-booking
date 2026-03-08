import Joi from "joi";

export const createRoleSchema = {
  body: Joi.object({
    roleName: Joi.string().trim().min(1).max(255).messages({
      "any.required": "Role name is required",
      "string.base": "Role name must be a string",
      "string.empty": "Role name cannot be empty",
      "string.min": "Role name cannot be empty",
      "string.max": "Role name must not exceed 255 characters",
    }),
  }),
};
