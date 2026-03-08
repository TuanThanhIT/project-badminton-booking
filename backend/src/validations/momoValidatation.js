import Joi from "joi";

export const createPaymentSchema = {
  body: Joi.object({
    entityId: Joi.number().integer().positive().required().messages({
      "number.base": "Entity ID must be a number",
      "number.integer": "Entity ID must be an integer",
      "number.positive": "Entity ID must be a positive number",
      "any.required": "Entity ID is required",
    }),

    amount: Joi.number().positive().precision(0).required().messages({
      "number.base": "Amount must be a number",
      "number.positive": "Amount must be greater than 0",
      "any.required": "Amount is required",
    }),

    orderInfo: Joi.string().trim().min(5).max(255).required().messages({
      "string.base": "Order info must be a string",
      "string.empty": "Order info must not be empty",
      "string.min": "Order info must be at least 5 characters",
      "string.max": "Order info must be at most 255 characters",
      "any.required": "Order info is required",
    }),

    type: Joi.string().valid("order", "booking").default("order").messages({
      "any.only": "Payment type must be order or booking",
    }),
  }),
};
