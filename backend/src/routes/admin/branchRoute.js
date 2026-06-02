import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import adminBranchController from "../../controllers/admin/branchController.js";
import {
  adminBranchIdSchema,
  branchImageSchema,
  createAdminBranchSchema,
  deleteBranchImageSchema,
  getAdminBranchesSchema,
  updateAdminBranchSchema,
} from "../../validations/branchValidation.js";

const adminBranchRoute = express.Router();

const initAdminBranchRoute = (app) => {
  adminBranchRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(getAdminBranchesSchema),
    adminBranchController.getAdminBranchesController,
  );

  adminBranchRoute.get(
    "/:branchId",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(adminBranchIdSchema),
    adminBranchController.getAdminBranchDetailController,
  );

  adminBranchRoute.post(
    "/",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(createAdminBranchSchema),
    adminBranchController.createBranchController,
  );

  adminBranchRoute.put(
    "/:branchId",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(updateAdminBranchSchema),
    adminBranchController.updateBranchController,
  );

  adminBranchRoute.put(
    "/:branchId/toggle-active",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(adminBranchIdSchema),
    adminBranchController.toggleBranchActiveController,
  );

  adminBranchRoute.post(
    "/:branchId/images",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(branchImageSchema),
    adminBranchController.addBranchImageController,
  );

  adminBranchRoute.delete(
    "/:branchId/images/:imageId",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(deleteBranchImageSchema),
    adminBranchController.deleteBranchImageController,
  );

  app.use("/admin/branches", adminBranchRoute);
};

export default initAdminBranchRoute;
