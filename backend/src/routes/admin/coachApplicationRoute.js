import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import coachApplicationAdminController from "../../controllers/admin/coachApplicationController.js";
import {
  applicationIdParamSchema,
  getCoachApplicationsSchema,
  rejectCoachApplicationSchema,
} from "../../validations/coachApplicationValidation.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const adminCoachApplicationRoute = express.Router();

const initAdminCoachApplicationRoute = (app) => {
  adminCoachApplicationRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(getCoachApplicationsSchema),
    coachApplicationAdminController.getCoachApplicationsController,
  );

  adminCoachApplicationRoute.get(
    "/:id",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(applicationIdParamSchema),
    coachApplicationAdminController.getCoachApplicationDetailController,
  );

  adminCoachApplicationRoute.patch(
    "/:id/approve",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(applicationIdParamSchema),
    coachApplicationAdminController.approveCoachApplicationController,
  );

  adminCoachApplicationRoute.patch(
    "/:id/reject",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(rejectCoachApplicationSchema),
    coachApplicationAdminController.rejectCoachApplicationController,
  );

  app.use("/admin/coach-applications", adminCoachApplicationRoute);
};

export default initAdminCoachApplicationRoute;
