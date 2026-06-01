import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import orderController from "../../controllers/manager/orderController.js";
import {
  getOrdersSchema,
  orderActionIdSchema,
} from "../../validations/orderValidation.js";

const orderRoute = express.Router();

const initOrderRoute = (app) => {
  orderRoute.get(
    "/",
    auth,
    authorize("MANAGER"),
    validate(getOrdersSchema),
    orderController.getOrders,
  );

  orderRoute.get(
    "/monthly-highlights",
    auth,
    authorize("MANAGER"),
    orderController.getMonthlyHighlights,
  );

  orderRoute.get(
    "/:orderId",
    auth,
    authorize("MANAGER"),
    validate(orderActionIdSchema),
    orderController.getOrderDetail,
  );

  app.use("/manager/orders", orderRoute);
};

export default initOrderRoute;
