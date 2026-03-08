import express from "express";
import courtController from "../../controllers/customer/courtController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  getCourtScheduleSchema,
  getCourtsSchema,
} from "../../validations/courtValidation.js";

const courtRoute = express.Router();

const initCourtCustomerRoute = (app) => {
  courtRoute.get(
    "/list",
    auth,
    authorize("USER"),
    validate(getCourtsSchema),
    courtController.getCourts,
  );
  courtRoute.get(
    "/schedule/:courtId",
    auth,
    authorize("USER"),
    validate(getCourtScheduleSchema),
    courtController.getCourtSchedule,
  );
  courtRoute.get(
    "/price",
    auth,
    authorize("USER"),
    courtController.getCourtPrice,
  );
  app.use("/user/court", courtRoute);
};
export default initCourtCustomerRoute;
