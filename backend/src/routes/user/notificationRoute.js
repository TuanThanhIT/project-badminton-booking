import express from "express";
import notificationController from "../../controllers/user/notificationController.js";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import {
  getNotificationsSchema,
  updateNotificationSchema,
} from "../../validations/notificationValidation.js";

const notificationRoute = express.Router();

const initNotificationRoute = (app) => {
  notificationRoute.get(
    "/",
    auth,
    validate(getNotificationsSchema),
    notificationController.getMyNotificationsController,
  );

  notificationRoute.patch(
    "/read-all",
    auth,
    notificationController.markAllNotificationsReadController,
  );

  notificationRoute.patch(
    "/:notificationId/read",
    auth,
    validate(updateNotificationSchema),
    notificationController.markNotificationReadController,
  );

  app.use("/user/notifications", notificationRoute);
};

export default initNotificationRoute;
