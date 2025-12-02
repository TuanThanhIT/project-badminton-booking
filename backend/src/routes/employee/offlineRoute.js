import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import offlineController from "../../controllers/employee/offlineController.js";

const offlineRoute = express.Router();

const initOfflineEmployeeRoute = (app) => {
  offlineRoute.post(
    "/add/:id",
    auth,
    authorize("EMPLOYEE"),
    offlineController.createOffline
  );
  offlineRoute.patch(
    "/update/:id",
    auth,
    authorize("EMPLOYEE"),
    offlineController.updateOffline
  );
  app.use("/employee/offline", offlineRoute);
};
export default initOfflineEmployeeRoute;
