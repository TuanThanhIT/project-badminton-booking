import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import notificationController from "../../controllers/admin/notificationController.js";
import validate from "../../middlewares/validate.js";
import { updateNotificationSchema } from "../../validations/notificationValidation.js";

const notificationRoute = express.Router();

const initNotificationAdminRoute = (app) => {
  notificationRoute.get(
    "/list",
    auth,
    authorize("EMPLOYEE"),
    notificationController.getNotifications,
  );
  notificationRoute.patch(
    "/update/all",
    auth,
    authorize("EMPLOYEE"),
    notificationController.updateAllNotification,
  );
  notificationRoute.patch(
    "/update/:notificationId",
    auth,
    authorize("EMPLOYEE"),
    validate(updateNotificationSchema),
    notificationController.updateNotification,
  );

  app.use("/admin/notification", notificationRoute);
};
export default initNotificationAdminRoute;
