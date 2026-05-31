import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import adminBranchController from "../../controllers/admin/branchController.js";

const adminBranchRoute = express.Router();

const initAdminBranchRoute = (app) => {
  adminBranchRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminBranchController.getAdminBranchesController,
  );

  adminBranchRoute.get(
    "/:branchId",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminBranchController.getAdminBranchDetailController,
  );

  adminBranchRoute.post(
    "/",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminBranchController.createBranchController,
  );

  adminBranchRoute.put(
    "/:branchId",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminBranchController.updateBranchController,
  );

  adminBranchRoute.put(
    "/:branchId/toggle-active",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminBranchController.toggleBranchActiveController,
  );

  adminBranchRoute.post(
    "/:branchId/images",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminBranchController.addBranchImageController,
  );

  adminBranchRoute.delete(
    "/:branchId/images/:imageId",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminBranchController.deleteBranchImageController,
  );

  app.use("/admin/branches", adminBranchRoute);
};

export default initAdminBranchRoute;
