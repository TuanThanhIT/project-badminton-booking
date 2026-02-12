import Joi from "joi";
import { idParams } from "./common/idSchema.js";
import { contentField, ratingField } from "./common/bookingFeedbackSchema.js";

export const createBookingFeedbackSchema = {
  body: Joi.object({
    content: contentField,
    rate: ratingField,
    bookingId: idParams("bookingId"),
    courtId: idParams("courtId"),
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
    content: contentField,
    rate: ratingField,
  }),
};

export const getBookingFeedbackSchema = {
  params: Joi.object({
    courtId: Joi.number().integer().positive().required(),
  }),
};
