import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import orderController from "../../controllers/admin/orderController.js";

const orderRoute = express.Router();

const initOrderAdminRoute = (app) => {
  orderRoute.get(
    "/count",
    auth,
    authorize("ADMIN"),
    orderController.countOrderByOrderStatus
  );

  app.use("/admin/order", orderRoute);
};
export default initOrderAdminRoute;
