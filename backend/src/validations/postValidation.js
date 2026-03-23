import Joi from "joi";
import {
  titleField,
  contentField,
  postTypeField,
  formDataField,
  idParamField,
} from "./common/postFields.js";
import { pageField, limitField } from "./common/paginationFields.js";

export const createPostSchema = {
  body: Joi.object({
    title: titleField,
    content: contentField,
    type: postTypeField,
    formData: formDataField,
  }),
};

export const getPostsSchema = {
  query: Joi.object({
    page: pageField,
    limit: limitField,
    type: postTypeField.optional(),
  }).unknown(true), // Cho phép unknown fields từ formData
};

export const getPostByIdSchema = {
  params: Joi.object({
    id: idParamField,
  }),
};

export const updatePostSchema = {
  params: Joi.object({
    id: idParamField,
  }),
  body: Joi.object({
    title: titleField.optional(),
    content: contentField.optional(),
    formData: formDataField.optional(),
  }),
};

export const deletePostSchema = {
  params: Joi.object({
    id: idParamField,
  }),
};