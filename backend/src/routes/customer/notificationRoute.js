import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import notificationController from "../../controllers/customer/notificationController.js";

const notificationRoute = express.Router();

const initNotificationCustomerRoute = (app) => {
  notificationRoute.get(
    "/list",
    auth,
    authorize("USER"),
    notificationController.getNotifications
  );
  notificationRoute.patch(
    "/update/all",
    auth,
    authorize("USER"),
    notificationController.updateAllNotification
  );
  notificationRoute.patch(
    "/update/:id",
    auth,
    authorize("USER"),
    notificationController.updateNotification
  );

  app.use("/user/notification", notificationRoute);
};
export default initNotificationCustomerRoute;
