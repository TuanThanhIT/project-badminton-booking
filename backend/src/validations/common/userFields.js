import Joi from "joi";

export const fullNameField = Joi.string()
  .trim()
  .min(2)
  .max(100)
  .optional()
  .messages({
    "string.base": "Full name must be a string",
    "string.min": "Full name must be at least 2 characters",
    "string.max": "Full name must be at most 100 characters",
  });

export const addressField = Joi.string().trim().max(255).optional().messages({
  "string.base": "Address must be a string",
  "string.max": "Address must be at most 255 characters",
});

export const phoneNumberField = Joi.string()
  .pattern(/^[0-9]{9,11}$/)
  .optional()
  .messages({
    "string.pattern.base": "Phone number must contain 9 to 11 digits",
  });
