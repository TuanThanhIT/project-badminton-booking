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
  requestOrderActionSchema,
  walletOrderConfirmSchema,
} from "../../validations/orderValidation.js";
import orderController from "../../controllers/user/orderController.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const orderRoute = express.Router();

const initOrderRoute = (app) => {
  orderRoute.post(
    "/checkout/preview",
    auth,
    authorize(ROLE_NAME.USER),
    validate(checkoutPreviewSchema),
    orderController.checkoutPreviewController,
  );

  orderRoute.post(
    "/checkout/shipping",
    auth,
    authorize(ROLE_NAME.USER),
    validate(calculateShippingSchema),
    orderController.calculateShippingController,
  );

  orderRoute.delete(
    "/checkout/session",
    auth,
    authorize(ROLE_NAME.USER),
    validate(clearCheckoutSessionSchema),
    orderController.clearCheckoutSessionController,
  );

  orderRoute.post(
    "/",
    auth,
    authorize(ROLE_NAME.USER),
    validate(createOrderSchema),
    orderController.createOrderController,
  );

  orderRoute.patch(
    "/vnpay/callback",
    auth,
    authorize(ROLE_NAME.USER),
    validate(orderCallbackSchema),
    orderController.orderCallbackController,
  );

  orderRoute.patch(
    "/wallet/confirm",
    auth,
    authorize(ROLE_NAME.USER),
    validate(walletOrderConfirmSchema),
    orderController.walletOrderConfirmController,
  );

  orderRoute.get(
    "/tracking/:orderId",
    auth,
    authorize(ROLE_NAME.USER),
    validate(getOrderTrackingSchema),
    orderController.getOrderTrackingController,
  );

  orderRoute.get(
    "/progress/:orderId",
    auth,
    authorize(ROLE_NAME.USER),
    validate(getTrackingProgressSchema),
    orderController.getTrackingProgressController,
  );

  orderRoute.get(
    "/detail/:orderId",
    auth,
    authorize(ROLE_NAME.USER),
    validate(getOrderDetailSchema),
    orderController.getOrderDetailController,
  );

  orderRoute.get(
    "/group/:orderGroupId",
    auth,
    authorize(ROLE_NAME.USER),
    validate(getOrderGroupByIdSchema),
    orderController.getOrderGroupByIdController,
  );

  orderRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.USER),
    validate(getUserOrdersSchema),
    orderController.getUserOrdersController,
  );

  orderRoute.post(
    "/:orderId/cancel-request",
    auth,
    authorize(ROLE_NAME.USER),
    validate(requestOrderActionSchema),
    orderController.requestCancelOrderController,
  );

  orderRoute.post(
    "/:orderId/return-request",
    auth,
    authorize(ROLE_NAME.USER),
    validate(requestOrderActionSchema),
    orderController.requestReturnOrderController,
  );

  app.use("/user/orders", orderRoute);
};

export default initOrderRoute;
