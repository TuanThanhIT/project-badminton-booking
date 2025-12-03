import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import courtController from "../../controllers/employee/courtController.js";

const courtRoute = express.Router();

const initCourtEmployeeRoute = (app) => {
  courtRoute.get(
    "/schedule/list",
    auth,
    authorize("EMPLOYEE"),
    courtController.getCourtScheduleByDate
  );
  app.use("/employee/court", courtRoute);
};
export default initCourtEmployeeRoute;
