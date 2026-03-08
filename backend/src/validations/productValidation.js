import Joi from "joi";
import { idParams, priceField, stockField } from "./common/numberField.js";
import {
  brandField,
  colorField,
  colorsField,
  descriptionField,
  discountField,
  groupNameField,
  materialField,
  materialsField,
  pricesField,
  productNameField,
  sizeField,
  sizesField,
  skuField,
  sortField,
} from "./common/productFields.js";
import { limitField, pageField } from "./common/paginationFields.js";
import { keywordField } from "./common/searchFields.js";
import { thumbnailUrlField } from "./common/urlField.js";

export const getProductsByFilterSchema = {
  query: Joi.object({
    cateId: idParams("cateId"),
    prices: pricesField,
    sizes: sizesField,
    colors: colorsField,
    materials: materialsField,
    excludeProductId: idParams("excludeProductId"),
    sort: sortField,
    page: pageField,
    limitField: limitField,
    keyword: keywordField,
  }),
};

export const getProductsByGroupNameAndFilterSchema = {
  query: Joi.object({
    groupName: groupNameField,
    prices: pricesField,
    sizes: sizesField,
    colors: colorsField,
    materials: materialsField,
    excludeProductId: idParams("excludeProductId"),
    sort: sortField,
    page: pageField,
    limit: limitField,
    keyword: keywordField,
  }),
};

export const getProductDetailSchema = {
  params: Joi.object({
    productId: idParams("productId"),
  }),
};

export const getProductsSchema = {
  query: Joi.object({
    keyword: keywordField,
  }),
};

export const createProductSchema = {
  body: Joi.object({
    productName: productNameField.required(),
    brand: brandField.required(),
    description: descriptionField.required(),
    thumbnailUrl: thumbnailUrlField,
    categoryId: idParams("categoryId"),
  }),
};

export const createProductVariantSchema = {
  params: Joi.object({
    productId: idParams("productId"),
  }),
  body: Joi.object({
    sku: skuField.required(),
    price: priceField.required(),
    stock: stockField.required(),
    discount: discountField,
    color: colorField.required(),
    size: sizeField.required(),
    material: materialField.required(),
  }),
};

export const getProductVariantByIdSchema = {
  params: Joi.object({
    variantId: idParams("variantId"),
  }),
};

export const updateProductVariantSchema = {
  params: Joi.object({
    variantId: idParams("variantId"),
  }),
  body: Joi.object({
    sku: skuField.optional(),
    price: priceField.optional(),
    stock: stockField.optional(),
    discount: discountField,
    color: colorField.optional(),
    size: sizeField.optional(),
    material: materialField.optional(),
  })
    .min(1)
    .messages({
      "object.min":
        "At least one field must be provided to update product variant",
    }),
};

export const getProductVariantsByProductIdSchema = {
  params: Joi.object({
    productId: idParams("productId"),
  }),
};

export const deleteProductVariantSchema = {
  params: Joi.object({
    variantId: idParams("variantId"),
  }),
};

export const createProductImagesSchema = {
  params: Joi.object({
    productId: idParams("productId"),
  }),
  body: Joi.object({
    thumbnailUrls: Joi.array()
      .items(thumbnailUrlField)
      .min(1)
      .optional()
      .messages({
        "array.base": "Image URLs must be an array",
        "array.min": "At least one image URL is required",
        "any.required": "Image URLs are required",
      }),
  }),
};

export const getAdProductsSchema = {
  query: Joi.object({
    page: pageField,
    limit: limitField,
    search: keywordField,
  }),
};

export const getProductByIdSchema = {
  params: Joi.object({
    productId: idParams("productId"),
  }),
};

export const updateProductSchema = {
  params: Joi.object({
    productId: idParams("productId"),
  }),
  body: Joi.object({
    productName: productNameField.optional(),
    brand: brandField.optional(),
    description: descriptionField.optional(),
    thumbnailUrl: thumbnailUrlField,
  }),
};

export const deleteProductImageSchema = {
  params: Joi.object({
    imageId: idParams("imageId"),
  }),
};

export const updateProductImageSchema = {
  params: Joi.object({
    imageId: idParams("imageId"),
  }),
  body: Joi.object({
    thumbnailUrl: thumbnailUrlField,
  }),
};

export const getProductImagesSchema = {
  params: Joi.object({
    productId: idParams("productId"),
  }),
};
