import Joi from "joi";
import { idParams } from "./common/numberField.js";
import {
  bookingStatusField,
  cancelReasonField,
  codeField,
  noteField,
  paymentAmountField,
  paymentMethodField,
  paymentStatusField,
  totalAmountField,
} from "./common/bookingFields.js";
import { limitField, pageField } from "./common/paginationFields.js";
import { dateField, keywordField } from "./common/searchFields.js";

export const createBookingSchema = {
  body: Joi.object({
    bookingStatus: bookingStatusField.required(),
    totalAmount: totalAmountField,
    paymentAmount: paymentAmountField,
    paymentMethod: paymentMethodField,
    paymentStatus: paymentStatusField,
    bookingDetails: Joi.array()
      .items(
        Joi.object({
          courtScheduleId: idParams("courtScheduleId"),
        }),
      )
      .min(1)
      .max(3)
      .unique((a, b) => a.courtScheduleId === b.courtScheduleId)
      .required()
      .messages({
        "array.base": "Booking details must be an array",
        "array.min": "At least one time slot must be selected",
        "array.max": "You can select up to 3 time slots per court per day",
        "any.required": "Booking details are required",
      }),

    code: codeField,
    note: noteField,
  })
    // custom rule: paymentAmount === totalAmount
    .custom((value, helpers) => {
      if (Math.abs(value.paymentAmount - value.totalAmount) > 0.01) {
        return helpers.error("any.custom");
      }
      return value;
    })
    .messages({
      "any.custom": "Payment amount must be equal to total amount",
    }),
};

export const cancelBookingSchema = {
  params: Joi.object({
    bookingId: idParams("bookingId"),
  }),
  body: Joi.object({
    cancelReason: cancelReasonField,
  }),
};

export const getBookingsSchema = {
  query: Joi.object({
    status: bookingStatusField.optional(),
    keyword: keywordField,
    date: dateField,
    page: pageField,
    limit: limitField,
  }),
};

export const confirmedBookingSchema = {
  params: Joi.object({
    bookingId: idParams("bookingId"),
  }),
};

export const completedBookingSchema = {
  params: Joi.object({
    bookingId: idParams("bookingId"),
  }),
};

export const countBookingByBookingStatusSchema = {
  query: Joi.object({
    date: dateField,
  }),
};
