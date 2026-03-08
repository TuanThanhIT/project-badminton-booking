import Joi from "joi";
import { idParams } from "./common/numberField.js";
import { contentField, ratingField } from "./common/feedbackFields.js";

export const createBookingFeedbackSchema = {
  body: Joi.object({
    content: contentField.required(),
    rate: ratingField.required(),
    bookingId: idParams("bookingId").required(),
    courtId: idParams("courtId").required(),
  }),
};

export const getBookingFeedbackUpdateSchema = {
  params: Joi.object({
    bookingId: idParams("bookingId"),
  }),
};

export const updateBookingFeedbackSchema = {
  params: Joi.object({
    bookingId: idParams("bookingId"),
  }),
  body: Joi.object({
    content: contentField.optional(),
    rate: ratingField.optional(),
  })
    .min(1) // BẮT BUỘC phải update ít nhất 1 field
    .messages({
      "object.min": "You must update at least content or rating",
    }),
};

export const getBookingFeedbackSchema = {
  params: Joi.object({
    courtId: idParams("courtId"),
  }),
};
