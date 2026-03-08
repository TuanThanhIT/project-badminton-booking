// validators/draftBooking.schema.js
import Joi from "joi";
import { idParams, priceField, quantityField } from "./common/numberField.js";
import { noteField, totalAmountField } from "./common/bookingFields.js";

const courtScheduleItemSchema = Joi.object({
  courtScheduleId: idParams("courtScheduleId"),
  price: priceField.required(),
});

const productItemSchema = Joi.object({
  productVarientId: idParams("productVarientId"),
  quantity: quantityField,
  subTotal: priceField.required(),
});

const beverageItemSchema = Joi.object({
  beverageId: idParams("beverageId"),
  quantity: quantityField,
  subTotal: priceField.required(),
});

export const createAndUpdateDraftSchema = {
  body: Joi.object({
    draftId: idParams("draftId"),
    note: noteField,
    total: totalAmountField,
    courtSchedules: Joi.array().items(courtScheduleItemSchema).default([]),
    products: Joi.array().items(productItemSchema).default([]),
    beverages: Joi.array().items(beverageItemSchema).default([]),
  }),
};

export const createDraftSchema = {
  body: Joi.object({
    nameCustomer: Joi.string().trim().min(2).max(100).required().messages({
      "string.base": "Tên khách hàng phải là chuỗi",
      "string.empty": "Tên khách hàng không được để trống",
      "string.min": "Tên khách hàng phải có ít nhất 2 ký tự",
      "string.max": "Tên khách hàng tối đa 100 ký tự",
      "any.required": "Tên khách hàng là bắt buộc",
    }),
  }),
};

export const getDraftSchema = {
  params: Joi.object({
    draftId: idParams("draftId"),
  }),
};

export const deleteDraftSchema = {
  params: Joi.object({
    draftId: idParams("draftId"),
  }),
};
