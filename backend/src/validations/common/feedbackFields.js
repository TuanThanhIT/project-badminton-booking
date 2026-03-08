// common/feedbackFields.js
import Joi from "joi";

export const ratingField = Joi.number().integer().min(1).max(5).messages({
  "number.base": "Rating must be a number",
  "number.integer": "Rating must be an integer",
  "number.min": "Rating must be at least 1",
  "number.max": "Rating must be at most 5",
});

export const contentField = Joi.string().trim().min(1).max(1000).messages({
  "string.base": "Content must be a string",
  "string.min": "Content must not be empty",
  "string.max": "Content must be at most 1000 characters",
});
