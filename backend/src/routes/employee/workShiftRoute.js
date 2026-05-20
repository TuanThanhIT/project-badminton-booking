import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import workShiftController from "../../controllers/employee/workShiftController.js";
import {
  getCurrentWorkShiftSchema,
  getShiftAssignmentsSchema,
  getWorkShiftByDateSchema,
  updateCheckInAndCashRegisterSchema,
  updateCheckOutAndCashRegisterSchema,
  updateShiftAssignmentTimeSchema,
} from "../../validations/workShiftValidation.js";

const workShiftRoute = express.Router();

const initEmployeeWorkShiftRoute = (app) => {
  workShiftRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(getWorkShiftByDateSchema),
    workShiftController.getWorkShiftByDate,
  );

  workShiftRoute.get(
    "/current",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(getCurrentWorkShiftSchema),
    workShiftController.getCurrentWorkShift,
  );

  workShiftRoute.patch(
    "/:workShiftId/check-in",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(updateCheckInAndCashRegisterSchema),
    workShiftController.updateCheckInAndCashRegister,
  );

  workShiftRoute.get(
    "/:workShiftId/assignments",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(getShiftAssignmentsSchema),
    workShiftController.getShiftAssignments,
  );

  workShiftRoute.patch(
    "/:workShiftId/assignments/:assignmentId",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(updateShiftAssignmentTimeSchema),
    workShiftController.updateShiftAssignmentTime,
  );

  workShiftRoute.patch(
    "/:workShiftId/check-out",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(updateCheckOutAndCashRegisterSchema),
    workShiftController.updateCheckOutAndCashRegister,
  );

  app.use("/employee/work-shifts", workShiftRoute);
};

export default initEmployeeWorkShiftRoute;
