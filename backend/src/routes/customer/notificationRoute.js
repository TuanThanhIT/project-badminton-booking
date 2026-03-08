import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import notificationController from "../../controllers/customer/notificationController.js";
import validate from "../../middlewares/validate.js";
import { updateNotificationSchema } from "../../validations/notificationValidation.js";

const notificationRoute = express.Router();

const initNotificationCustomerRoute = (app) => {
  notificationRoute.get(
    "/list",
    auth,
    authorize("USER"),
    notificationController.getNotifications,
  );
  notificationRoute.patch(
    "/update/all",
    auth,
    authorize("USER"),
    notificationController.updateAllNotification,
  );
  notificationRoute.patch(
    "/update/:notificationId",
    auth,
    authorize("USER"),
    validate(updateNotificationSchema),
    notificationController.updateNotification,
  );

  app.use("/user/notification", notificationRoute);
};
export default initNotificationCustomerRoute;
