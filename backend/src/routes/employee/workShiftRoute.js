import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import workShiftController from "../../controllers/employee/workShiftController.js";

const workShiftRoute = express.Router();

const initWorkShiftEmployeeRoute = (app) => {
  workShiftRoute.get(
    "/list/:date",
    auth,
    authorize("EMPLOYEE"),
    workShiftController.getWorkShiftByDate
  );
  workShiftRoute.patch(
    "/update/:id",
    auth,
    authorize("EMPLOYEE"),
    workShiftController.updateWorkShiftEmployeeAndCashRegister
  );
  app.use("/employee/work-shift", workShiftRoute);
};
export default initWorkShiftEmployeeRoute;
