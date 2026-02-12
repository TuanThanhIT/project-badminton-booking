import Joi from "joi";

export const ratingField = Joi.number()
  .integer()
  .min(1)
  .max(5)
  .required()
  .messages({
    "number.base": "Rating must be a number",
    "number.integer": "Rating must be an integer",
    "number.min": "Rating must be at least 1",
    "number.max": "Rating must be at most 5",
    "any.required": "Rating is required",
  });

export const contentField = Joi.string()
  .trim()
  .min(1)
  .max(1000)
  .required()
  .messages({
    "string.base": "Content must be a string",
    "string.empty": "Content must not be empty",
    "string.min": "Content must not be empty",
    "string.max": "Content must be at most 1000 characters",
    "any.required": "Content is required",
  });
