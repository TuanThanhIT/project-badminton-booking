import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import workShiftController from "../../controllers/admin/workShiftController.js";

const workShiftRoute = express.Router();

const initWorkShiftAdminRoute = (app) => {
  workShiftRoute.post(
    "/add",
    // auth,
    // authorize(),
    workShiftController.createWorkShifts
  );

  workShiftRoute.get(
    "/",
    // auth,
    // authorize(),
    workShiftController.getAllWorkShifts
  );

  app.use("/admin/workshift", workShiftRoute);
};
export default initWorkShiftAdminRoute;
