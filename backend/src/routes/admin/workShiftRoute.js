import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import workShiftController from "../../controllers/admin/workShiftController.js";

const workShiftRoute = express.Router();

const initWorkShiftAdminRoute = (app) => {
  workShiftRoute.post(
    "/add",
    auth,
    authorize("ADMIN"),
    workShiftController.createWorkShift
  );
  app.use("/admin/work-shift", workShiftRoute);
};
export default initWorkShiftAdminRoute;
