import Joi from "joi";
import { idParams } from "./common/numberField.js";
import { contentField, ratingField } from "./common/feedbackFields.js";

export const createFeedbackOrderSchema = {
  body: Joi.object({
    orderId: idParams("orderId"),
    variantId: idParams("variantId"),
    content: contentField.required(),
    rating: ratingField.required(),
  }),
};

export const updateFeedbackOrderSchema = {
  params: Joi.object({
    orderId: idParams("orderId"),
    variantId: idParams("variantId"),
  }),
  body: Joi.object({
    content: contentField.optional(),
    rating: ratingField.optional(),
  }),
};

export const getFeedbackOrderDetailSchema = {
  params: Joi.object({
    orderId: idParams("orderId"),
    variantId: idParams("variantId"),
  }),
};

export const deleteFeedbackOrderSchema = {
  params: Joi.object({
    feedbackId: idParams("feedbackId"),
  }),
};
