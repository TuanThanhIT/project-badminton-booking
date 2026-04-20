import Joi from "joi";
import {
  cancelReasonField,
  codeField,
  noteField,
  paymentAmountField,
  paymentMethodField,
  paymentStatusField,
  totalAmountField,
} from "./common/bookingFields.js";
import { orderStatusField } from "./common/orderFields.js";
import { idParams, quantityField } from "./common/numberField.js";
import { dateField, keywordField } from "./common/searchFields.js";
import { limitField, pageField } from "./common/paginationFields.js";

export const createOrderSchema = {
  body: Joi.object({
    orderStatus: orderStatusField.required(),
    totalAmount: totalAmountField,
    paymentAmount: paymentAmountField,
    paymentMethod: paymentMethodField,
    paymentStatus: paymentStatusField,
    orderDetails: Joi.array()
      .items(
        Joi.object({
          varientId: idParams("varientId"),
          quantity: quantityField,
          subTotal: Joi.number().min(0).required().messages({
            "number.base": "Sub total must be a number",
            "number.min": "Sub total must be greater than or equal to 0",
            "any.required": "Sub total is required",
          }),
        }),
      )
      .min(1)
      .required(),

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

export const cancelOrderSchema = {
  params: Joi.object({
    orderId: idParams("orderId"),
  }),
  body: Joi.object({
    cancelReason: cancelReasonField,
  }),
};

export const getOrdersSchema = {
  query: Joi.object({
    status: orderStatusField.optional(),
    keyword: keywordField,
    date: dateField,
    page: pageField,
    limit: limitField,
  }),
};

export const confirmedOrderSchema = {
  params: Joi.object({
    orderId: idParams("orderId"),
  }),
};

export const completedOrderSchema = {
  params: Joi.object({
    orderId: idParams("orderId"),
  }),
};

export const countOrderByOrderStatusSchema = {
  query: Joi.object({
    date: dateField,
  }),
};

export const checkoutPreviewSchema = {
  body: Joi.object({
    cartId: idParams("cartId"),
    addressId: idParams("addressId"),
  }),
};

export const calculateShippingSchema = {
  body: Joi.object({
    cartId: idParams("cartId"),
  }),
};

export const clearCheckoutSessionSchema = {
  body: Joi.object({
    cartId: idParams("cartId"),
  }),
};
