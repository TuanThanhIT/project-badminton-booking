import express from "express";
import validate from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import {
  confirmedOrderSchema,
  prepareOrderSchema,
  readyToShipSchema,
  shipOrderSchema,
} from "../../validations/orderValidation.js";
import orderController from "../../controllers/employee/orderController.js";

const orderRoute = express.Router();

const initEmployeeOrderRoute = (app) => {
  orderRoute.patch(
    "/confirm/:orderId",
    auth,
    authorize("USER", "EMPLOYEE"),
    validate(confirmedOrderSchema),
    orderController.confirmOrderController,
  );
  orderRoute.patch(
    "/prepare/:orderId",
    auth,
    authorize("USER", "EMPLOYEE"),
    validate(prepareOrderSchema),
    orderController.prepareOrderController,
  );
  orderRoute.patch(
    "/ready-to-ship/:orderId",
    auth,
    authorize("USER", "EMPLOYEE"),
    validate(readyToShipSchema),
    orderController.readyToShipController,
  );
  orderRoute.patch(
    "/ship/:orderId",
    auth,
    authorize("USER", "EMPLOYEE"),
    validate(shipOrderSchema),
    orderController.shipOrderController,
  );

  app.use("/employee/orders", orderRoute);
};

export default initEmployeeOrderRoute;
