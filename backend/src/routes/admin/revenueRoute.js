import express from "express";
import revenueController from "../../controllers/admin/revenueController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  getBookingOrderListSchema,
  getDashboardOverviewSchema,
  getRevenueBeverageSchema,
  getRevenueByDaySchema,
  getRevenueProductSchema,
} from "../../validations/revenueValidation.js";

const revenueRoute = express.Router();

const initRevenueAdminRoute = (app) => {
  revenueRoute.get(
    "/overview",
    auth,
    authorize("ADMIN"),
    validate(getDashboardOverviewSchema),
    revenueController.getDashboardOverview,
  );
  revenueRoute.get(
    "/date",
    auth,
    authorize("ADMIN"),
    validate(getRevenueByDaySchema),
    revenueController.getRevenueByDate,
  );
  revenueRoute.get(
    "/list",
    auth,
    authorize("ADMIN"),
    validate(getBookingOrderListSchema),
    revenueController.getBookingOrderList,
  );
  revenueRoute.get(
    "/product",
    auth,
    authorize("ADMIN"),
    validate(getRevenueProductSchema),
    revenueController.getRevenueProduct,
  );
  revenueRoute.get(
    "/beverage",
    auth,
    authorize("ADMIN"),
    validate(getRevenueBeverageSchema),
    revenueController.getRevenueBeverage,
  );
  app.use("/admin/revenue", revenueRoute);
};

export default initRevenueAdminRoute;
