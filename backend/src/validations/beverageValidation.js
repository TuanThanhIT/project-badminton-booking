import Joi from "joi";
import { keywordField } from "./common/searchFields.js";
import { thumbnailUrlField } from "./common/urlField.js";
import { idParams, priceField, stockField } from "./common/numberField.js";
import { limitField, pageField } from "./common/paginationFields.js";

export const getBeveragesSchema = {
  query: Joi.object({
    keyword: keywordField,
  }),
};

export const addBeverageSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(1).max(255).required().messages({
      "any.required": "Beverage name is required",
      "string.base": "Beverage name must be a string",
      "string.empty": "Beverage name cannot be empty",
      "string.max": "Beverage name must not exceed 255 characters",
    }),
    price: priceField.required(),
    stock: stockField.required(),
    thumbnailUrl: thumbnailUrlField,
  }),
};

export const updateBeverageSchema = {
  params: Joi.object({
    beverageId: idParams("beverageId"),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(1).max(255).optional().messages({
      "any.required": "Beverage name is required",
      "string.base": "Beverage name must be a string",
      "string.empty": "Beverage name cannot be empty",
      "string.max": "Beverage name must not exceed 255 characters",
    }),
    price: priceField.optional(),
    stock: stockField.optional(),
    thumbnailUrl: thumbnailUrlField,
  })
    .min(1)
    .message({
      "object.min": "At least one field must be provided to update beverage",
    }),
};

export const getBeverageByIdSchema = {
  params: Joi.object({
    beverageId: idParams("beverageId"),
  }),
};

export const getAllBeveragesSchema = {
  query: Joi.object({
    page: pageField,
    limit: limitField,
    keyword: keywordField,
  }),
};
