import express from "express";
import validate from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import {
  confirmedOrderSchema,
  orderActionIdSchema,
  prepareOrderSchema,
  readyToShipSchema,
  rejectOrderActionSchema,
  shipOrderSchema,
} from "../../validations/orderValidation.js";
import orderController from "../../controllers/employee/orderController.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const orderRoute = express.Router();

const initEmployeeOrderRoute = (app) => {
  orderRoute.patch(
    "/confirm/:orderId",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(confirmedOrderSchema),
    orderController.confirmOrderController,
  );
  orderRoute.patch(
    "/prepare/:orderId",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(prepareOrderSchema),
    orderController.prepareOrderController,
  );
  orderRoute.patch(
    "/ready-to-ship/:orderId",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(readyToShipSchema),
    orderController.readyToShipController,
  );
  orderRoute.patch(
    "/ship/:orderId",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(shipOrderSchema),
    orderController.shipOrderController,
  );
  // EMPLOYEE duyệt hủy
  orderRoute.post(
    "/:orderId/cancel/approve",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(orderActionIdSchema),
    orderController.approveCancelOrderController,
  );
  // EMPLOYEE từ chối hủy
  orderRoute.post(
    "/:orderId/cancel/reject",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(rejectOrderActionSchema),
    orderController.rejectCancelOrderController,
  );
  // EMPLOYEE duyệt yêu cầu trả hàng
  orderRoute.post(
    "/:orderId/return/approve",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(orderActionIdSchema),
    orderController.approveReturnOrderController,
  );
  // EMPLOYEE xác nhận shop đã nhận hàng hoàn và hoàn tiền
  orderRoute.post(
    "/:orderId/return/complete",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(orderActionIdSchema),
    orderController.completeReturnOrderController,
  );
  // EMPLOYEE yêu cầu GHN hoàn hàng về shop khi đơn chưa giao xong
  orderRoute.post(
    "/:orderId/ghn-return",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(orderActionIdSchema),
    orderController.forceReturnGHNOrderController,
  );

  app.use("/employee/orders", orderRoute);
};

export default initEmployeeOrderRoute;
