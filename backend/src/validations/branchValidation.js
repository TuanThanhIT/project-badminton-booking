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
    city: Joi.string().optional(),
    district: Joi.string().optional(),
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
