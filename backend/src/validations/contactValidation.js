import Joi from "joi";
import {
  addressField,
  fullNameField,
  phoneNumberField,
} from "./common/userFields.js";

export const submitContactSchema = {
  body: Joi.object({
    fullName: fullNameField,
    address: addressField,
    phoneNumber: phoneNumberField,
    subject: Joi.string().trim().min(5).max(150).required().messages({
      "string.base": "Subject must be a string",
      "string.empty": "Subject must not be empty",
      "string.min": "Subject must be at least 5 characters",
      "string.max": "Subject must be at most 150 characters",
      "any.required": "Subject is required",
    }),
    message: Joi.string().trim().min(10).max(2000).required().messages({
      "string.base": "Message must be a string",
      "string.empty": "Message must not be empty",
      "string.min": "Message must be at least 10 characters",
      "string.max": "Message must be at most 2000 characters",
      "any.required": "Message is required",
    }),
  }),
};
