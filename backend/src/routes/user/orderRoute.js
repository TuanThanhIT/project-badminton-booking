import express from "express";
import validate from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import {
  calculateShippingSchema,
  checkoutPreviewSchema,
  clearCheckoutSessionSchema,
} from "../../validations/orderValidation.js";
import orderController from "../../controllers/user/orderController.js";

const orderRoute = express.Router();

const initOrderRoute = (app) => {
  orderRoute.post(
    "/checkout/preview",
    auth,
    authorize("USER"),
    validate(checkoutPreviewSchema),
    orderController.checkoutPreviewController,
  );
  orderRoute.post(
    "/checkout/shipping",
    auth,
    authorize("USER"),
    validate(calculateShippingSchema),
    orderController.calculateShippingController,
  );
  orderRoute.delete(
    "/checkout/session",
    auth,
    authorize("USER"),
    validate(clearCheckoutSessionSchema),
    orderController.clearCheckoutSessionController,
  );
  app.use("/user/orders", orderRoute);
};

export default initOrderRoute;
