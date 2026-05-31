import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import workShiftController from "../../controllers/manager/workShiftController.js";

const workShiftRoute = express.Router();

const initWorkShiftRoute = (app) => {
  workShiftRoute.get(
    "/",
    auth,
    authorize("MANAGER"),
    workShiftController.getWorkShifts,
  );

  workShiftRoute.post(
    "/",
    auth,
    authorize("MANAGER"),
    workShiftController.createWorkShift,
  );

  workShiftRoute.post(
    "/assignments",
    auth,
    authorize("MANAGER"),
    workShiftController.assignEmployeeToShift,
  );

  workShiftRoute.patch(
    "/assignments/:assignmentId",
    auth,
    authorize("MANAGER"),
    workShiftController.updateShiftAssignment,
  );

  workShiftRoute.delete(
    "/assignments/:assignmentId",
    auth,
    authorize("MANAGER"),
    workShiftController.removeShiftAssignment,
  );

  app.use("/manager/work-shifts", workShiftRoute);
};

export default initWorkShiftRoute;
