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
