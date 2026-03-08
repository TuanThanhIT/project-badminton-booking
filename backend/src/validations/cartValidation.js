import Joi from "joi";
import { idParams, quantityField } from "./common/numberField.js";

export const addItemToCartSchema = {
  body: Joi.object({
    varientId: idParams("varientId"),
    quantity: quantityField,
  }),
};

export const updateQuantitySchema = {
  params: Joi.object({
    cartItemId: idParams("cartItemId"),
  }),
  body: Joi.object({
    quantity: quantityField,
  }),
};

export const deleteCartItemSchema = {
  params: Joi.object({
    cartItemId: idParams("cartItemId"),
  }),
};
