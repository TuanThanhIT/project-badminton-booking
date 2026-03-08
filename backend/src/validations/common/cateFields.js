import Joi from "joi";

export const cateNameField = Joi.string().trim().min(1).max(255).messages({
  "any.required": "Category name is required",
  "string.base": "Category name must be a string",
  "string.empty": "Category name cannot be empty",
  "string.min": "Category name cannot be empty",
  "string.max": "Category name must not exceed 255 characters",
});

export const menuGroupField = Joi.string().trim().min(1).max(100).messages({
  "any.required": "Menu group is required",
  "string.base": "Menu group must be a string",
  "string.empty": "Menu group cannot be empty",
  "string.min": "Menu group cannot be empty",
  "string.max": "Menu group must not exceed 100 characters",
});
