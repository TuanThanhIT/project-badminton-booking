import Joi from "joi";

export const idParams = (name = "id") =>
  Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": `${name} must be a number`,
      "number.integer": `${name} must be an integer`,
      "number.positive": `${name} must be a positive number`,
      "any.required": `${name} is required`,
    });

/** Query param id — bỏ qua 0 / chuỗi rỗng (tránh lỗi khi URL thiếu cateId) */
export const optionalIdQuery = (name = "id") =>
  Joi.number()
    .integer()
    .positive()
    .optional()
    .empty([0, "0", "", null])
    .messages({
      "number.base": `${name} must be a number`,
      "number.integer": `${name} must be an integer`,
      "number.positive": `${name} must be a positive number`,
    });

export const quantityField = Joi.number().integer().min(1).required().messages({
  "number.base": "Quantity must be a number",
  "number.integer": "Quantity must be an integer",
  "number.min": "Quantity must be at least 1",
  "any.required": "Quantity is required",
});

export const priceField = Joi.number().min(0).messages({
  "number.base": "Price must be a number",
  "number.min": "Price must be greater than or equal to 0",
  "any.required": "Price is required",
});

export const stockField = Joi.number().integer().min(0).messages({
  "any.required": "Stock is required",
  "number.base": "Stock must be a number",
  "number.integer": "Stock must be an integer",
  "number.min": "Stock must be greater than or equal to 0",
});
