import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import notificationController from "../../controllers/employee/notificationController.js";

const notificationRoute = express.Router();

const initNotificationEmployeeRoute = (app) => {
  notificationRoute.get(
    "/list",
    auth,
    authorize("EMPLOYEE"),
    notificationController.getNotifications
  );
  notificationRoute.patch(
    "/update/all",
    auth,
    authorize("EMPLOYEE"),
    notificationController.updateAllNotification
  );
  notificationRoute.patch(
    "/update/:id",
    auth,
    authorize("EMPLOYEE"),
    notificationController.updateNotification
  );

  app.use("/employee/notification", notificationRoute);
};
export default initNotificationEmployeeRoute;
