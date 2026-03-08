import express from "express";
import orderController from "../../controllers/customer/orderController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  cancelOrderSchema,
  createOrderSchema,
} from "../../validations/orderValidation.js";

const orderRoute = express.Router();

const initOrderCustomerRoute = (app) => {
  orderRoute.post(
    "/add",
    auth,
    authorize("USER"),
    validate(createOrderSchema),
    orderController.createOrder,
  );
  orderRoute.get("/list", auth, authorize("USER"), orderController.getOrders);
  orderRoute.patch(
    "/cancel/:orderId",
    auth,
    authorize("USER"),
    validate(cancelOrderSchema),
    orderController.cancelOrder,
  );
  app.use("/user/order", orderRoute);
};
export default initOrderCustomerRoute;
