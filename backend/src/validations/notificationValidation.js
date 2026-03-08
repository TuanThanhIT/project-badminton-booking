import Joi from "joi";
import { idParams } from "./common/numberField.js";

export const updateNotificationSchema = {
  params: Joi.object({
    notificationId: idParams("notificationId"),
  }),
};
