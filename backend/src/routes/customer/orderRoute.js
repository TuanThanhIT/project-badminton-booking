import express from "express";
import orderController from "../../controllers/customer/orderController.js";

const orderRoute = express.Router();

const initOrderCustomerRoute = (app) => {
  orderRoute.post("/add", orderController.createOrder);
  orderRoute.get("/list", orderController.getOrders);
  orderRoute.patch("/cancel/:id", orderController.cancelOrder);
  app.use("/user/order", orderRoute);
};
export default initOrderCustomerRoute;
