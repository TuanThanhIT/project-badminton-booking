import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import orderController from "../../controllers/employee/orderController.js";
import validate from "../../middlewares/validate.js";
import {
  cancelOrderSchema,
  completedOrderSchema,
  confirmedOrderSchema,
  getOrdersSchema,
} from "../../validations/orderValidation.js";

const orderRoute = express.Router();

const initOrderEmployeeRoute = (app) => {
  orderRoute.get(
    "/list",
    auth,
    authorize("EMPLOYEE"),
    validate(getOrdersSchema),
    orderController.getOrders,
  );
  orderRoute.patch(
    "/confirm/:orderId",
    auth,
    authorize("EMPLOYEE"),
    validate(confirmedOrderSchema),
    orderController.confirmedOrder,
  );
  orderRoute.patch(
    "/complete/:orderId",
    auth,
    authorize("EMPLOYEE"),
    validate(completedOrderSchema),
    orderController.completedOrder,
  );
  orderRoute.patch(
    "/cancel/:orderId",
    auth,
    authorize("EMPLOYEE"),
    validate(cancelOrderSchema),
    orderController.cancelOrder,
  );
  app.use("/employee/order", orderRoute);
};
export default initOrderEmployeeRoute;
