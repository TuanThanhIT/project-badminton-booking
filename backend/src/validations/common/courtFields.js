import Joi from "joi";

export const nameCourtField = Joi.string().trim().min(1).max(255).messages({
  "any.required": "Court name is required",
  "string.base": "Court name must be a string",
  "string.empty": "Court name cannot be empty",
  "string.min": "Court name cannot be empty",
  "string.max": "Court name must not exceed 255 characters",
});

export const locationField = Joi.string().trim().min(1).max(255).messages({
  "any.required": "Location is required",
  "string.base": "Location must be a string",
  "string.empty": "Location cannot be empty",
  "string.min": "Location cannot be empty",
  "string.max": "Location must not exceed 255 characters",
});
