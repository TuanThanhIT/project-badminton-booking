import Joi from "joi";
import { idParams } from "./common/numberField.js";
import { limitField, pageField } from "./common/paginationFields.js";
import { thumbnailUrlField } from "./common/urlField.js";

import {
  branchNameField,
  addressField,
  phoneNumberField,
  descriptionField,
  isActiveField,
  cityField,
  districtField,
} from "./common/branchFields.js";

export const getBranchesSchema = {
  query: Joi.object({
    page: pageField,
    limit: limitField,
    provinceName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .messages({
        "string.base": "Province name must be a string",
        "string.min": "Province name must be at least 2 characters",
        "string.max": "Province name must not exceed 100 characters",
      })
      .optional(),
    districtName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .messages({
        "string.base": "District name must be a string",
        "string.min": "District name must be at least 2 characters",
        "string.max": "District name must not exceed 100 characters",
      })
      .optional(),
  }),
};

export const getBranchByIdSchema = {
  params: Joi.object({
    branchId: idParams("branchId"),
  }),
};

export const createBranchSchema = {
  body: Joi.object({
    branchName: branchNameField.required(),
    address: addressField.required(),
    phoneNumber: phoneNumberField.required(),
    description: descriptionField,
    thumbnailUrl: thumbnailUrlField,
    isActive: isActiveField,
    city: cityField,
    district: districtField,
  }),
};

export const updateBranchSchema = {
  params: Joi.object({
    branchId: idParams("branchId"),
  }),
  body: Joi.object({
    branchName: branchNameField.optional(),
    address: addressField.optional(),
    phoneNumber: phoneNumberField.optional(),
    description: descriptionField.optional(),
    thumbnailUrl: thumbnailUrlField.optional(),
    isActive: isActiveField.optional(),
    city: cityField.optional(),
    district: districtField.optional(),
  })
    .min(1)
    .message({
      "object.min": "At least one field must be provided to update branch",
    }),
};

const adminTextField = (label, max = 255) =>
  Joi.string()
    .trim()
    .min(1)
    .max(max)
    .messages({
      "any.required": `${label} is required`,
      "string.base": `${label} must be a string`,
      "string.empty": `${label} cannot be empty`,
      "string.min": `${label} cannot be empty`,
      "string.max": `${label} must not exceed ${max} characters`,
    });

const adminIdField = (label) =>
  Joi.number()
    .integer()
    .min(1)
    .messages({
      "any.required": `${label} is required`,
      "number.base": `${label} must be a number`,
      "number.integer": `${label} must be an integer`,
      "number.min": `${label} must be greater than 0`,
    });

const latitudeField = Joi.number().min(-90).max(90).messages({
  "any.required": "Latitude is required",
  "number.base": "Latitude must be a number",
  "number.min": "Latitude must be >= -90",
  "number.max": "Latitude must be <= 90",
});

const longitudeField = Joi.number().min(-180).max(180).messages({
  "any.required": "Longitude is required",
  "number.base": "Longitude must be a number",
  "number.min": "Longitude must be >= -180",
  "number.max": "Longitude must be <= 180",
});

const adminBranchBody = {
  branchName: adminTextField("Branch name").required(),
  phoneNumber: phoneNumberField.required(),
  description: Joi.string().trim().min(10).max(65535).required().messages({
    "any.required": "Description is required",
    "string.base": "Description must be a string",
    "string.empty": "Description cannot be empty",
    "string.min": "Description must be at least 10 characters",
    "string.max": "Description is too long",
  }),
  address: adminTextField("Address").required(),
  provinceName: adminTextField("Province name", 100).required(),
  districtName: adminTextField("District name", 100).required(),
  wardName: adminTextField("Ward name", 100).required(),
  provinceId: adminIdField("Province ID").required(),
  districtId: adminIdField("District ID").required(),
  wardCode: Joi.string().trim().min(1).max(20).required().messages({
    "any.required": "Ward code is required",
    "string.base": "Ward code must be a string",
    "string.empty": "Ward code cannot be empty",
    "string.max": "Ward code must not exceed 20 characters",
  }),
  latitude: latitudeField.required(),
  longitude: longitudeField.required(),
  ghnShopId: adminIdField("GHN shop ID").optional(),
};

export const getAdminBranchesSchema = {
  query: Joi.object({
    page: pageField,
    limit: limitField,
    search: Joi.string().trim().allow("").max(255).optional(),
    isActive: Joi.alternatives().try(Joi.boolean(), Joi.string().valid("true", "false", "")).optional(),
  }),
};

export const adminBranchIdSchema = {
  params: Joi.object({
    branchId: idParams("branchId"),
  }),
};

export const createAdminBranchSchema = {
  body: Joi.object(adminBranchBody),
};

export const updateAdminBranchSchema = {
  params: Joi.object({
    branchId: idParams("branchId"),
  }),
  body: Joi.object({
    ...Object.fromEntries(
      Object.entries(adminBranchBody).map(([key, schema]) => [key, schema.optional()]),
    ),
  })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided to update branch",
    }),
};

export const branchImageSchema = {
  params: Joi.object({
    branchId: idParams("branchId"),
  }),
  body: Joi.object({
    imageUrl: thumbnailUrlField.required(),
  }),
};

export const deleteBranchImageSchema = {
  params: Joi.object({
    branchId: idParams("branchId"),
    imageId: idParams("imageId"),
  }),
};
