import Joi from "joi";
import { idParams } from "./common/numberField.js";
import { contentField, ratingField } from "./common/feedbackFields.js";

export const createFeedbackSchema = {
  body: Joi.object({
    content: contentField.required(),
    rate: ratingField.required(),
    orderDetailId: idParams("orderDetailId"),
  }),
};

export const getFeedbackUpdateSchema = {
  params: Joi.object({
    orderDetailId: idParams("orderDetailId"),
  }),
};

export const updateFeedbackSchema = {
  params: Joi.object({
    orderDetailId: idParams("orderDetailId"),
  }),
  body: Joi.object({
    content: contentField.optional(),
    rate: ratingField.optional(),
  })
    .min(1)
    .messages({
      "object.min": "You must update at least content or rating",
    }),
};

export const getProductFeedbackSchema = {
  params: Joi.object({
    productId: idParams("productId"),
  }),
};
