import Joi from "joi";
import {
  ORDER_GROUP_STATUS,
  ORDER_STATUS,
} from "../../constants/orderConstant.js";

export const orderStatusField = Joi.string()
  .valid(...Object.values(ORDER_STATUS))
  .messages({
    "any.only": "Invalid order status",
    "any.required": "Order status is required",
    "string.base": "Order status must be a string",
  });

export const orderFilterStatusField = Joi.string()
  .valid("ALL", ...Object.values(ORDER_STATUS))
  .messages({
    "any.only": "Invalid order status",
    "string.base": "Order status must be a string",
  });

export const orderGroupStatusField = Joi.string()
  .valid("ALL", ...Object.values(ORDER_GROUP_STATUS))
  .default("ALL")
  .messages({
    "any.only": "Invalid order status",
    "string.base": "Order status must be a string",
  });
