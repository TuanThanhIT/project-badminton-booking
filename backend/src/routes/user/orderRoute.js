import express from "express";
import validate from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import {
  calculateShippingSchema,
  checkoutPreviewSchema,
  clearCheckoutSessionSchema,
  createOrderSchema,
  getOrderDetailSchema,
  getOrderGroupByIdSchema,
  getOrderTrackingSchema,
  getTrackingProgressSchema,
  getUserOrdersSchema,
  orderCallbackSchema,
  walletOrderConfirmSchema,
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

  orderRoute.post(
    "/",
    auth,
    authorize("USER"),
    validate(createOrderSchema),
    orderController.createOrderController,
  );

  orderRoute.patch(
    "/vnpay/callback",
    auth,
    authorize("USER"),
    validate(orderCallbackSchema),
    orderController.orderCallbackController,
  );

  orderRoute.patch(
    "/wallet/confirm",
    auth,
    authorize("USER"),
    validate(walletOrderConfirmSchema),
    orderController.walletOrderConfirmController,
  );

  orderRoute.get(
    "/tracking/:orderId",
    auth,
    authorize("USER"),
    validate(getOrderTrackingSchema),
    orderController.getOrderTrackingController,
  );

  orderRoute.get(
    "/progress/:orderId",
    auth,
    authorize("USER"),
    validate(getTrackingProgressSchema),
    orderController.getTrackingProgressController,
  );

  orderRoute.get(
    "/detail/:orderId",
    auth,
    authorize("USER"),
    validate(getOrderDetailSchema),
    orderController.getOrderDetailController,
  );

  orderRoute.get(
    "/group/:orderGroupId",
    auth,
    authorize("USER"),
    validate(getOrderGroupByIdSchema),
    orderController.getOrderGroupByIdController,
  );

  orderRoute.get(
    "/",
    auth,
    authorize("USER"),
    validate(getUserOrdersSchema),
    orderController.getUserOrdersController,
  );

  app.use("/user/orders", orderRoute);
};

export default initOrderRoute;
