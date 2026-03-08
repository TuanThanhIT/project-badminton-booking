import Joi from "joi";

export const timeField = Joi.string()
  .pattern(/^\d{1,2}:\d{2}(:\d{2})?$/)
  .required()
  .messages({
    "any.required": "Check-in time is required",
    "string.base": "Check-in time must be a string",
    "string.pattern.base": "Invalid check-in time format (HH:MM or HH:MM:SS)",
  });

export const cashField = Joi.number().min(0).required().messages({
  "any.required": "Cash amount is required",
  "number.base": "Cash must be a number",
  "number.min": "Cash must be greater than or equal to 0",
});

export const workDateField = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({
    "string.pattern.base": "Work date must be in format YYYY-MM-DD",
    "any.required": "Work date is required",
  });

export const shiftWageField = Joi.number().positive().required().messages({
  "number.base": "Shift wage must be a number",
  "number.positive": "Shift wage must be greater than 0",
  "any.required": "Shift wage is required",
});
