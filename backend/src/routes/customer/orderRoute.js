import express from "express";
import orderController from "../../controllers/customer/orderController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const orderRoute = express.Router();

const initOrderCustomerRoute = (app) => {
  orderRoute.post("/add", auth, authorize("USER"), orderController.createOrder);
  orderRoute.get("/list", auth, authorize("USER"), orderController.getOrders);
  orderRoute.patch(
    "/cancel/:id",
    auth,
    authorize("USER"),
    orderController.cancelOrder
  );
  app.use("/user/order", orderRoute);
};
export default initOrderCustomerRoute;
