import Joi from "joi";
import { SORT_OPTIONS } from "../../constants/productConstant.js";

export const groupNameField = Joi.string().trim().min(1).optional().messages({
  "string.base": "Group name must be a string",
  "string.empty": "Group name cannot be empty",
  "string.min": "Group name cannot be empty",
});

export const pricesField = Joi.string()
  .trim()
  .custom((value, helpers) => {
    const [min, max] = value.split("-").map(Number);
    if (min > max) {
      return helpers.message("Min price must be less than max price");
    }
    return value;
  })
  .optional()
  .messages({
    "string.base": "Prices must be a string",
    "string.pattern.base": "Price range must be in format min-max",
  });

export const branchesField = Joi.string().trim().optional().messages({
  "string.base": "Branches must be a string",
  "string.pattern.base": "Branches must be comma separated",
});

export const sizesField = Joi.string().trim().optional().messages({
  "string.base": "Sizes must be a string",
  "string.pattern.base": "Sizes must be comma separated",
});

export const colorsField = Joi.string().trim().optional().messages({
  "string.base": "Colors must be a string",
  "string.pattern.base": "Colors must be comma separated",
});

export const materialsField = Joi.string().trim().optional().messages({
  "string.base": "Materials must be a string",
  "string.pattern.base": "Materials must be comma separated",
});

export const sortField = Joi.string()
  .valid(...Object.keys(SORT_OPTIONS))
  .optional()
  .messages({
    "string.base": "Sort must be a string",
    "any.only": "Sort value is invalid",
  });

export const productNameField = Joi.string().trim().min(2).max(255).messages({
  "string.base": "Product name must be a string",
  "string.empty": "Product name cannot be empty",
  "string.min": "Product name must be at least {#limit} characters long",
  "string.max": "Product name must not exceed {#limit} characters",
  "any.required": "Product name is required",
});

export const brandField = Joi.string().trim().max(255).messages({
  "string.base": "Brand must be a string",
  "string.max": "Brand must not exceed {#limit} characters",
});

export const descriptionField = Joi.string().trim().min(1).messages({
  "string.base": "Description must be a string",
  "string.empty": "Description cannot be empty",
  "any.required": "Description is required",
});

export const skuField = Joi.string().trim().max(255).messages({
  "string.base": "SKU must be a string",
  "string.max": "SKU must not exceed {#limit} characters",
});

export const discountField = Joi.number().min(0).max(100).optional().messages({
  "number.base": "Discount must be a number",
  "number.min": "Discount cannot be less than 0",
  "number.max": "Discount cannot be greater than 100",
});

export const colorField = Joi.string().trim().max(255).messages({
  "string.base": "Color must be a string",
  "string.max": "Color must not exceed {#limit} characters",
});

export const sizeField = Joi.string().trim().max(255).messages({
  "string.base": "Size must be a string",
  "string.max": "Size must not exceed {#limit} characters",
});

export const materialField = Joi.string().trim().max(255).messages({
  "string.base": "Material must be a string",
  "string.max": "Material must not exceed {#limit} characters",
});
