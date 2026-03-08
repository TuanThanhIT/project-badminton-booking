import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import workShiftController from "../../controllers/employee/workShiftController.js";
import validate from "../../middlewares/validate.js";
import {
  getWorkShiftByDateSchema,
  updateCheckInAndCashRegisterSchema,
  updateCheckOutAndCashRegisterSchema,
} from "../../validations/workShiftValidation.js";

const workShiftRoute = express.Router();

const initWorkShiftEmployeeRoute = (app) => {
  workShiftRoute.get(
    "/list/:date",
    auth,
    authorize("EMPLOYEE"),
    validate(getWorkShiftByDateSchema),
    workShiftController.getWorkShiftByDate,
  );
  workShiftRoute.patch(
    "/update/check-in/:workShiftId",
    auth,
    authorize("EMPLOYEE"),
    validate(updateCheckInAndCashRegisterSchema),
    workShiftController.updateCheckInAndCashRegister,
  );
  workShiftRoute.patch(
    "/update/check-out/:workShiftId",
    auth,
    authorize("EMPLOYEE"),
    validate(updateCheckOutAndCashRegisterSchema),
    workShiftController.updateCheckOutAndCashRegister,
  );
  app.use("/employee/work-shift", workShiftRoute);
};
export default initWorkShiftEmployeeRoute;
