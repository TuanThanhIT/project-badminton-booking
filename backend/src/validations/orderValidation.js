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
import {
  orderFilterStatusField,
  orderGroupStatusField,
  orderStatusField,
} from "./common/orderFields.js";
import { idParams, quantityField } from "./common/numberField.js";
import { dateField, keywordField } from "./common/searchFields.js";
import { limitField, pageField } from "./common/paginationFields.js";
import { emailField, otpCodeField } from "./common/authFields.js";
import OrderGroup from "../models/orderGroup.js";

const buyNowItemSchema = Joi.object({
  variantId: idParams("variantId"),
  quantity: quantityField,
});

// export const createOrderSchema = {
//   body: Joi.object({
//     orderStatus: orderStatusField.required(),
//     totalAmount: totalAmountField,
//     paymentAmount: paymentAmountField,
//     paymentMethod: paymentMethodField,
//     paymentStatus: paymentStatusField,
//     orderDetails: Joi.array()
//       .items(
//         Joi.object({
//           varientId: idParams("varientId"),
//           quantity: quantityField,
//           subTotal: Joi.number().min(0).required().messages({
//             "number.base": "Sub total must be a number",
//             "number.min": "Sub total must be greater than or equal to 0",
//             "any.required": "Sub total is required",
//           }),
//         }),
//       )
//       .min(1)
//       .required(),

//     code: codeField,
//     note: noteField,
//   })
//     // custom rule: paymentAmount === totalAmount
//     .custom((value, helpers) => {
//       if (Math.abs(value.paymentAmount - value.totalAmount) > 0.01) {
//         return helpers.error("any.custom");
//       }
//       return value;
//     })
//     .messages({
//       "any.custom": "Payment amount must be equal to total amount",
//     }),
// };

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
    status: orderFilterStatusField.optional(),
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

export const prepareOrderSchema = {
  params: Joi.object({
    orderId: idParams("orderId"),
  }),
};

export const readyToShipSchema = {
  params: Joi.object({
    orderId: idParams("orderId"),
  }),
};

export const shipOrderSchema = {
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
    cartItemIds: Joi.array().items(idParams("cartItemId")).min(1),
    buyNowItem: buyNowItemSchema,
  }).xor("cartItemIds", "buyNowItem"),
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

export const createOrderSchema = {
  body: Joi.object({
    cartId: idParams("cartId"),
    addressId: idParams("addressId"),
    cartItemIds: Joi.array().items(idParams("cartItemId")).min(1),
    buyNowItem: buyNowItemSchema,
    paymentMethod: paymentMethodField,
    note: noteField,
  }).xor("cartItemIds", "buyNowItem"),
};

export const orderCallbackSchema = {
  body: Joi.object({
    vnp_Amount: Joi.string().pattern(/^\d+$/).required().messages({
      "string.empty": "Amount is required",
      "string.pattern.base": "Amount must be a number string",
      "any.required": "Amount is required",
    }),
    vnp_BankCode: Joi.string().trim().required().messages({
      "string.empty": "Bank code is required",
      "any.required": "Bank code is required",
    }),
    vnp_BankTranNo: Joi.string().trim().required().messages({
      "string.empty": "Bank transaction number is required",
      "any.required": "Bank transaction number is required",
    }),
    vnp_CardType: Joi.string().trim().required().messages({
      "string.empty": "Card type is required",
      "any.required": "Card type is required",
    }),
    vnp_OrderInfo: Joi.string().trim().required().messages({
      "string.empty": "Order info is required",
      "any.required": "Order info is required",
    }),
    vnp_PayDate: Joi.string()
      .pattern(/^\d{14}$/)
      .required()
      .messages({
        "string.empty": "Pay date is required",
        "string.pattern.base": "Pay date must be format yyyyMMddHHmmss",
        "any.required": "Pay date is required",
      }),
    vnp_ResponseCode: Joi.string().length(2).required().messages({
      "string.length": "Response code must be 2 characters",
      "any.required": "Response code is required",
    }),
    vnp_TmnCode: Joi.string().required().messages({
      "string.empty": "Terminal code is required",
      "any.required": "Terminal code is required",
    }),
    vnp_TransactionNo: Joi.string().pattern(/^\d+$/).required().messages({
      "string.pattern.base": "Transaction number must be digits",
      "any.required": "Transaction number is required",
    }),
    vnp_TransactionStatus: Joi.string().length(2).required().messages({
      "string.length": "Transaction status must be 2 characters",
      "any.required": "Transaction status is required",
    }),
    vnp_TxnRef: Joi.string().required().messages({
      "string.empty": "Transaction reference is required",
      "any.required": "Transaction reference is required",
    }),
    vnp_SecureHash: Joi.string().required().messages({
      "string.empty": "Secure hash is required",
      "any.required": "Secure hash is required",
    }),
  }),
};

export const walletOrderConfirmSchema = {
  body: Joi.object({
    otpCode: otpCodeField,
    email: emailField,
    orderGroupId: idParams("orderGroupId"),
  }),
};

export const getOrderGroupByIdSchema = {
  params: Joi.object({
    orderGroupId: idParams("orderGroupId"),
  }),
};

export const getOrderDetailSchema = {
  params: Joi.object({
    orderId: idParams("orderId"),
  }),
};

export const getOrderTrackingSchema = {
  params: Joi.object({
    orderId: idParams("orderId"),
  }),
};

export const getTrackingProgressSchema = {
  params: Joi.object({
    orderId: idParams("orderId"),
  }),
};

export const getUserOrdersSchema = {
  query: Joi.object({
    sort: Joi.string().valid("newest", "oldest").default("newest").messages({
      "any.only": "Sort must be 'newest' or 'oldest'",
      "string.base": "Sort must be a string",
    }),
    status: orderGroupStatusField,
    page: pageField,
    limit: limitField,
    dateFrom: dateField,
    dateTo: dateField,
  }),
};

export const requestOrderActionSchema = {
  params: Joi.object({
    orderId: idParams("orderId"),
  }),
  body: Joi.object({
    reason: Joi.string().trim().max(500).allow("", null).messages({
      "string.base": "Lý do phải là chuỗi",
      "string.max": "Lý do không được vượt quá 500 ký tự",
    }),
  }),
};

export const orderActionIdSchema = {
  params: Joi.object({
    orderId: idParams("orderId"),
  }),
};

export const rejectOrderActionSchema = {
  params: Joi.object({
    orderId: idParams("orderId"),
  }),
  body: Joi.object({
    reason: Joi.string().trim().max(500).allow("", null).messages({
      "string.base": "Lý do từ chối phải là chuỗi",
      "string.max": "Lý do từ chối không được vượt quá 500 ký tự",
    }),
  }),
};
