import Joi from "joi";
import { idParams } from "./common/numberField.js";
import { limitField, pageField } from "./common/paginationFields.js";

export const getNotificationsSchema = {
  query: Joi.object({
    page: pageField,
    limit: limitField,
  }),
};

export const updateNotificationSchema = {
  params: Joi.object({
    notificationId: idParams("notificationId"),
  }),
};
