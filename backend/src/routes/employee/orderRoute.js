import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import orderController from "../../controllers/employee/orderController.js";

const orderRoute = express.Router();

const initOrderEmployeeRoute = (app) => {
  orderRoute.get(
    "/list",
    auth,
    authorize("EMPLOYEE"),
    orderController.getOrders
  );
  orderRoute.patch(
    "/confirm/:id",
    auth,
    authorize("EMPLOYEE"),
    orderController.confirmedOrder
  );
  orderRoute.patch(
    "/complete/:id",
    auth,
    authorize("EMPLOYEE"),
    orderController.completedOrder
  );
  orderRoute.patch(
    "/cancel/:id",
    auth,
    authorize("EMPLOYEE"),
    orderController.cancelOrder
  );
  app.use("/employee/order", orderRoute);
};
export default initOrderEmployeeRoute;
