import Joi from "joi";
import { idParams } from "./common/numberField.js";
import {
  paymentMethodField,
  totalAmountField,
} from "./common/bookingFields.js";

export const createOfflineSchema = {
  params: Joi.object({
    draftId: idParams("draftId"),
  }),
};

export const updateOfflineSchema = {
  params: Joi.object({
    offlineBookingId: idParams("offlineBookingId"),
  }),
  body: Joi.object({
    paymentMethod: paymentMethodField,
    total: totalAmountField,
  }),
};
