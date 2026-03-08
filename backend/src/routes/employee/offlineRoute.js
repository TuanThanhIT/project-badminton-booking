import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import offlineController from "../../controllers/employee/offlineController.js";
import validate from "../../middlewares/validate.js";
import {
  createOfflineSchema,
  updateOfflineSchema,
} from "../../validations/offlineValidation.js";

const offlineRoute = express.Router();

const initOfflineEmployeeRoute = (app) => {
  offlineRoute.post(
    "/add/:draftId",
    auth,
    authorize("EMPLOYEE"),
    validate(createOfflineSchema),
    offlineController.createOffline,
  );
  offlineRoute.patch(
    "/update/:offlineBookingId",
    auth,
    authorize("EMPLOYEE"),
    validate(updateOfflineSchema),
    offlineController.updateOffline,
  );
  app.use("/employee/offline", offlineRoute);
};
export default initOfflineEmployeeRoute;
