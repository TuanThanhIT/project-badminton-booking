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
    workShiftController.getWorkShiftByDateController,
  );

  workShiftRoute.get(
    "/current",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(getCurrentWorkShiftSchema),
    workShiftController.getCurrentWorkShiftController,
  );

  workShiftRoute.patch(
    "/:workShiftId/check-in",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(updateCheckInAndCashRegisterSchema),
    workShiftController.updateCheckInAndCashRegisterController,
  );

  workShiftRoute.get(
    "/:workShiftId/assignments",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(getShiftAssignmentsSchema),
    workShiftController.getShiftAssignmentsController,
  );

  workShiftRoute.patch(
    "/:workShiftId/assignments/:assignmentId",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(updateShiftAssignmentTimeSchema),
    workShiftController.updateShiftAssignmentTimeController,
  );

  workShiftRoute.patch(
    "/:workShiftId/check-out",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(updateCheckOutAndCashRegisterSchema),
    workShiftController.updateCheckOutAndCashRegisterController,
  );

  app.use("/employee/work-shifts", workShiftRoute);
};

export default initEmployeeWorkShiftRoute;
