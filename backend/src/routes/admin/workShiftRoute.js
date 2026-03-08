import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import workShiftController from "../../controllers/admin/workShiftController.js";
import validate from "../../middlewares/validate.js";
import {
  createWorkShiftsSchema,
  getAllWorkShiftsSchema,
} from "../../validations/workShiftValidation.js";

const workShiftRoute = express.Router();

const initWorkShiftAdminRoute = (app) => {
  workShiftRoute.post(
    "/add",
    auth,
    authorize("ADMIN"),
    validate(createWorkShiftsSchema),
    workShiftController.createWorkShifts,
  );

  workShiftRoute.get(
    "/",
    auth,
    authorize("ADMIN"),
    validate(getAllWorkShiftsSchema),
    workShiftController.getAllWorkShifts,
  );

  app.use("/admin/work-shift", workShiftRoute);
};
export default initWorkShiftAdminRoute;
