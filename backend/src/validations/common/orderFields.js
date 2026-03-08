import Joi from "joi";
import { ORDER_STATUS } from "../../constants/orderConstant.js";

export const orderStatusField = Joi.string()
  .valid(...Object.values(ORDER_STATUS))
  .messages({
    "any.only": "Invalid order status",
    "any.required": "Order status is required",
    "string.base": "Order status must be a string",
  });
