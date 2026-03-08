import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import courtController from "../../controllers/employee/courtController.js";
import validate from "../../middlewares/validate.js";
import { getCourtScheduleByDateSchema } from "../../validations/courtValidation.js";

const courtRoute = express.Router();

const initCourtEmployeeRoute = (app) => {
  courtRoute.get(
    "/schedule/list",
    auth,
    authorize("EMPLOYEE"),
    validate(getCourtScheduleByDateSchema),
    courtController.getCourtScheduleByDate,
  );
  app.use("/employee/court", courtRoute);
};
export default initCourtEmployeeRoute;
