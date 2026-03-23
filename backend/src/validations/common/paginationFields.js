import Joi from "joi";

export const pageField = Joi.number().integer().min(1).default(1).messages({
  "number.base": "Page must be a number",
  "number.integer": "Page must be an integer",
  "number.min": "Page must be at least 1",
});

export const limitField = Joi.number()
  .integer()
  .min(1)
  .max(100)
  .default(10)
  .messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit must be at most 100",
  });
