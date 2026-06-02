import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import revenueController from "../../controllers/manager/revenueController.js";

const revenueRoute = express.Router();

const initRevenueRoute = (app) => {
  revenueRoute.get(
    "/",
    auth,
    authorize("MANAGER"),
    revenueController.getRevenue,
  );
  revenueRoute.get(
    "/dashboard",
    auth,
    authorize("MANAGER"),
    revenueController.getDashboard,
  );
  revenueRoute.get(
    "/report",
    auth,
    authorize("MANAGER"),
    revenueController.getRevenueReport,
  );

  app.use("/manager/revenues", revenueRoute);
};

export default initRevenueRoute;
