import Joi from "joi";
import { USER_ADDRESS_LABEL } from "../../constants/userConstant.js";

export const fullNameField = Joi.string().trim().min(2).max(100).messages({
  "string.base": "Full name must be a string",
  "string.min": "Full name must be at least 2 characters",
  "string.max": "Full name must be at most 100 characters",
});

export const phoneNumberField = Joi.string()
  .pattern(/^[0-9]{9,11}$/)
  .messages({
    "string.pattern.base": "Phone number must contain 9 to 11 digits",
  });

export const addressField = Joi.string().min(5).max(255).messages({
  "string.base": "Address must be a string",
  "string.empty": "Address cannot be empty",
  "string.min": "Address must be at least 5 characters",
  "string.max": "Address must not exceed 255 characters",
  "any.required": "Address is required",
});

export const provinceNameField = Joi.string().min(1).max(100).messages({
  "string.base": "Province must be a string",
  "string.empty": "Province cannot be empty",
  "string.min": "Province must be at least 1 character",
  "string.max": "Province must not exceed 100 characters",
  "any.required": "Province is required",
});

export const districtNameField = Joi.string().min(1).max(100).messages({
  "string.base": "District must be a string",
  "string.empty": "District cannot be empty",
  "string.min": "District must be at least 1 character",
  "string.max": "District must not exceed 100 characters",
  "any.required": "District is required",
});

export const wardNameField = Joi.string().min(1).max(100).messages({
  "string.base": "Ward must be a string",
  "string.empty": "Ward cannot be empty",
  "string.min": "Ward must be at least 1 character",
  "string.max": "Ward must not exceed 100 characters",
  "any.required": "Ward is required",
});
export const provinceIdField = Joi.number().messages({
  "number.base": "Province id must be a number",
  "any.required": "Province id is required",
});

export const districtIdField = Joi.number().messages({
  "number.base": "District id must be a number",
  "any.required": "District id is required",
});

export const wardCodeField = Joi.string().max(20).messages({
  "string.base": "Ward code must be a string",
  "string.empty": "Ward code cannot be empty",
  "string.max": "Ward code must not exceed 20 characters",
  "any.required": "Ward code is required",
});

export const latitudeField = Joi.number().min(-90).max(90).messages({
  "number.base": "Latitude must be a number",
  "number.min": "Latitude must be >= -90",
  "number.max": "Latitude must be <= 90",
  "any.required": "Latitude is required",
});

export const longitudeField = Joi.number().min(-180).max(180).messages({
  "number.base": "Longitude must be a number",
  "number.min": "Longitude must be >= -180",
  "number.max": "Longitude must be <= 180",
  "any.required": "Longitude is required",
});

export const labelField = Joi.valid(
  ...Object.values(USER_ADDRESS_LABEL),
).messages({
  "any.only": "Invalid address label",
  "any.required": "Address label is required",
  "string.base": "Address label must be a string",
});

export const isDefaultField = Joi.boolean().messages({
  "boolean.base": "isDefault must be a boolean",
});
