import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import orderController from "../../controllers/admin/orderController.js";
import validate from "../../middlewares/validate.js";
import { countOrderByOrderStatusSchema } from "../../validations/orderValidation.js";

const orderRoute = express.Router();

const initOrderAdminRoute = (app) => {
  orderRoute.get(
    "/count",
    auth,
    authorize("ADMIN"),
    validate(countOrderByOrderStatusSchema),
    orderController.countOrderByOrderStatus,
  );

  app.use("/admin/order", orderRoute);
};
export default initOrderAdminRoute;
