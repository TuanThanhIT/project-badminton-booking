import Joi from "joi";

export const branchNameField = Joi.string().trim().min(1).max(255).messages({
  "any.required": "Branch name is required",
  "string.base": "Branch name must be a string",
  "string.empty": "Branch name cannot be empty",
  "string.min": "Branch name cannot be empty",
  "string.max": "Branch name must not exceed 255 characters",
});

export const addressField = Joi.string().trim().min(1).max(255).messages({
  "any.required": "Address is required",
  "string.base": "Address must be a string",
  "string.empty": "Address cannot be empty",
  "string.min": "Address cannot be empty",
  "string.max": "Address must not exceed 255 characters",
});

export const phoneNumberField = Joi.string()
  .pattern(/^[0-9]{9,11}$/)
  .messages({
    "string.base": "Phone number must be a string",
    "string.empty": "Phone number cannot be empty",
    "string.pattern.base": "Phone number must contain 9-11 digits",
  });

export const descriptionField = Joi.string().allow("").max(500).messages({
  "string.base": "Description must be a string",
  "string.max": "Description must not exceed 500 characters",
});

export const isActiveField = Joi.boolean().messages({
  "boolean.base": "isActive must be true or false",
});
export const districtField = Joi.string().trim().min(1).max(100).messages({
  "string.base": "District must be a string",
  "string.empty": "District cannot be empty",
  "string.max": "District must not exceed 100 characters",
});

export const cityField = Joi.string().trim().min(1).max(100).messages({
  "string.base": "City must be a string",
  "string.empty": "City cannot be empty",
  "string.max": "City must not exceed 100 characters",
});
