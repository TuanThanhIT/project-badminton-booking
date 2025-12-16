import express from "express";
import revenueController from "../../controllers/admin/revenueController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const revenueRoute = express.Router();

const initRevenueAdminRoute = (app) => {
  revenueRoute.get(
    "/overview",
    auth,
    authorize("ADMIN"),
    revenueController.getDashboardOverview
  );
  revenueRoute.get(
    "/date",
    auth,
    authorize("ADMIN"),
    revenueController.getRevenueByDate
  );
  revenueRoute.get(
    "/list",
    auth,
    authorize("ADMIN"),
    revenueController.getBookingOrderList
  );
  revenueRoute.get(
    "/product",
    auth,
    authorize("ADMIN"),
    revenueController.getRevenueProduct
  );
  revenueRoute.get(
    "/beverage",
    auth,
    authorize("ADMIN"),
    revenueController.getRevenueBeverage
  );
  app.use("/admin/revenue", revenueRoute);
};

export default initRevenueAdminRoute;
