import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import adminRevenueController from "../../controllers/admin/revenueController.js";

const adminRevenueRoute = express.Router();

const initAdminRevenueRoute = (app) => {
  adminRevenueRoute.get("/dashboard", auth, authorize(ROLE_NAME.ADMIN), adminRevenueController.getDashboardController);
  adminRevenueRoute.get("/report", auth, authorize(ROLE_NAME.ADMIN), adminRevenueController.getRevenueReportController);
  adminRevenueRoute.get("/overview", auth, authorize(ROLE_NAME.ADMIN), adminRevenueController.getRevenueOverviewController);
  adminRevenueRoute.get("/by-branch", auth, authorize(ROLE_NAME.ADMIN), adminRevenueController.getRevenueByBranchController);
  adminRevenueRoute.get("/by-branch/:id/detail", auth, authorize(ROLE_NAME.ADMIN), adminRevenueController.getRevenueByBranchDetailController);
  adminRevenueRoute.get("/by-date", auth, authorize(ROLE_NAME.ADMIN), adminRevenueController.getRevenueByDateController);
  adminRevenueRoute.get("/by-month", auth, authorize(ROLE_NAME.ADMIN), adminRevenueController.getRevenueByMonthController);
  adminRevenueRoute.get("/products", auth, authorize(ROLE_NAME.ADMIN), adminRevenueController.getRevenueProductsController);
  adminRevenueRoute.get("/beverages", auth, authorize(ROLE_NAME.ADMIN), adminRevenueController.getRevenueBeveragesController);

  app.use("/admin/revenue", adminRevenueRoute);
};

export default initAdminRevenueRoute;
