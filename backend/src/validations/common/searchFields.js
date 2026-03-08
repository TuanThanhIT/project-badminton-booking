import Joi from "joi";

export const keywordField = Joi.string()
  .trim()
  .min(1)
  .max(255)
  .empty("")
  .optional()
  .messages({
    "string.base": "Keyword must be a string",
    "string.min": "Keyword cannot be empty",
    "string.max": "Keyword must be at most 255 characters",
  });

export const dateField = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .empty("")
  .optional()
  .messages({
    "string.base": "Date must be a string",
    "string.pattern.base": "Date must be in YYYY-MM-DD format",
  });
