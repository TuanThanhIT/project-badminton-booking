import Joi from "joi";
import { idParams } from "./common/numberField.js";
import {
  bookingStatusField,
  cancelReasonField,
  noteField,
  paymentMethodField,
} from "./common/bookingFields.js";
import { limitField, pageField } from "./common/paginationFields.js";
import { dateField, keywordField } from "./common/searchFields.js";
import { BOOKING_STATUS } from "../constants/bookingConstant.js";
import { PAYMENT_OFFLINE_METHOD_STATUS } from "../constants/paymentConstant.js";

export const createBookingSchema = {
  body: Joi.object({
    branchId: Joi.number().integer().positive().required(),
    courtId: Joi.number().integer().positive().required(),
    playDate: Joi.date().required(),
    startTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
    endTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
    paymentMethod: paymentMethodField,
    discountId: Joi.number().integer().positive().allow(null),
    note: noteField,
  }),
};

export const bookingCallbackSchema = {
  body: Joi.object({
    vnp_Amount: Joi.string().required(),
    vnp_BankCode: Joi.string().allow("").optional(),
    vnp_BankTranNo: Joi.string().allow("").optional(),
    vnp_CardType: Joi.string().allow("").optional(),
    vnp_OrderInfo: Joi.string().required(),
    vnp_PayDate: Joi.string().allow("").optional(),
    vnp_ResponseCode: Joi.string().required(),
    vnp_TmnCode: Joi.string().required(),
    vnp_TransactionNo: Joi.string().allow("").optional(),
    vnp_TransactionStatus: Joi.string().required(),
    vnp_TxnRef: Joi.string().required(),
    vnp_SecureHash: Joi.string().required(),
  }),
};

export const cancelBookingSchema = {
  params: Joi.object({
    bookingId: idParams("bookingId"),
  }),
  body: Joi.object({
    cancelReason: cancelReasonField.optional(),
    reason: Joi.string().trim().max(500).allow("", null).optional().messages({
      "string.base": "Lý do phải là chuỗi",
      "string.max": "Lý do không được vượt quá 500 ký tự",
    }),
  }),
};

export const getBookingsSchema = {
  query: Joi.object({
    status: bookingStatusField.valid("ALL", ...Object.values(BOOKING_STATUS)).optional(),
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

export const bookingActionIdSchema = {
  params: Joi.object({
    bookingId: idParams("bookingId"),
  }),
};

export const rejectBookingActionSchema = {
  params: Joi.object({
    bookingId: idParams("bookingId"),
  }),
  body: Joi.object({
    reason: Joi.string().trim().max(500).allow("", null).messages({
      "string.base": "Lý do phải là chuỗi",
      "string.max": "Lý do không được vượt quá 500 ký tự",
    }),
  }),
};

export const completeBookingActionSchema = {
  params: Joi.object({
    bookingId: idParams("bookingId"),
  }),
  body: Joi.object({
    paymentMethod: Joi.string()
      .valid(...Object.values(PAYMENT_OFFLINE_METHOD_STATUS))
      .optional()
      .messages({
        "any.only": "Phương thức thanh toán phải là CASH, VNPAY hoặc BANK",
      }),
  }),
};
