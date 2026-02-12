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
