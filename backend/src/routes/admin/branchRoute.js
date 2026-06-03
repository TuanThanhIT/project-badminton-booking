import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import adminBranchController from "../../controllers/admin/branchController.js";
import {
  adminBranchIdSchema,
  adminBranchTabQuerySchema,
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
    "/options",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminBranchController.getAdminBranchOptionsController,
  );

  adminBranchRoute.get(
    "/:branchId/overview",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(adminBranchIdSchema),
    adminBranchController.getAdminBranchOverviewController,
  );

  adminBranchRoute.get(
    "/:branchId/courts",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(adminBranchTabQuerySchema),
    adminBranchController.getAdminBranchCourtsController,
  );

  adminBranchRoute.get(
    "/:branchId/employees",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(adminBranchTabQuerySchema),
    adminBranchController.getAdminBranchEmployeesController,
  );

  adminBranchRoute.get(
    "/:branchId/bookings",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(adminBranchTabQuerySchema),
    adminBranchController.getAdminBranchBookingsController,
  );

  adminBranchRoute.get(
    "/:branchId/orders",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(adminBranchTabQuerySchema),
    adminBranchController.getAdminBranchOrdersController,
  );

  adminBranchRoute.get(
    "/:branchId/inventory",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(adminBranchTabQuerySchema),
    adminBranchController.getAdminBranchInventoryController,
  );

  adminBranchRoute.get(
    "/:branchId/purchase-receipts",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(adminBranchTabQuerySchema),
    adminBranchController.getAdminBranchPurchaseReceiptsController,
  );

  adminBranchRoute.get(
    "/:branchId/stock-history",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(adminBranchTabQuerySchema),
    adminBranchController.getAdminBranchStockHistoryController,
  );

  adminBranchRoute.get(
    "/:branchId/revenue",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(adminBranchTabQuerySchema),
    adminBranchController.getAdminBranchRevenueController,
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
