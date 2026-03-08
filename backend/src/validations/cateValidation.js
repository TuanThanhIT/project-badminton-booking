import Joi from "joi";
import { cateNameField, menuGroupField } from "./common/cateFields.js";
import { limitField, pageField } from "./common/paginationFields.js";
import { keywordField } from "./common/searchFields.js";
import { idParams } from "./common/numberField.js";

export const createCategorySchema = {
  body: Joi.object({
    cateName: cateNameField.required(),
    menuGroup: menuGroupField.required(),
  }),
};

export const getCategoriesSchema = {
  query: Joi.object({
    page: pageField,
    limit: limitField,
    search: keywordField,
  }),
};

export const updateCategorySchema = {
  params: Joi.object({
    cateId: idParams("cateId"),
  }),
  body: Joi.object({
    cateName: cateNameField.optional(),
    menuGroup: menuGroupField.optional(),
  })
    .min(1)
    .message({
      "object.min": "At least one field must be provided to update category",
    }),
};
