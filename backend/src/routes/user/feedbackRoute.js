import express from "express";
import validate from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

import {
  createFeedbackOrderSchema,
  deleteFeedbackOrderSchema,
  getFeedbackBranchDetailSchema,
  getFeedbackOrderDetailSchema,
  upsertFeedbackBranchSchema,
  updateFeedbackOrderSchema,
} from "../../validations/feedbackValidation.js";

import feedbackController from "../../controllers/user/feedbackController.js";

const feedbackRoute = express.Router();

const initFeedbackRoute = (app) => {
  // tạo feedback
  feedbackRoute.post(
    "/",
    auth,
    authorize(ROLE_NAME.USER),
    validate(createFeedbackOrderSchema),
    feedbackController.createFeedbackOrderController,
  );

  // lấy chi tiết feedback
  feedbackRoute.get(
    "/branches/:branchId/me",
    auth,
    authorize(ROLE_NAME.USER),
    validate(getFeedbackBranchDetailSchema),
    feedbackController.getFeedbackBranchDetailController,
  );

  feedbackRoute.put(
    "/branches/:branchId",
    auth,
    authorize(ROLE_NAME.USER),
    validate(upsertFeedbackBranchSchema),
    feedbackController.upsertFeedbackBranchController,
  );

  feedbackRoute.get(
    "/orders/:orderId/products/:variantId",
    auth,
    authorize(ROLE_NAME.USER),
    validate(getFeedbackOrderDetailSchema),
    feedbackController.getFeedbackOrderDetailController,
  );

  // cập nhật feedback
  feedbackRoute.patch(
    "/orders/:orderId/products/:variantId",
    auth,
    authorize(ROLE_NAME.USER),
    validate(updateFeedbackOrderSchema),
    feedbackController.updateFeedbackOrderController,
  );

  // xóa feedback
  feedbackRoute.delete(
    "/feedbackId",
    auth,
    authorize(ROLE_NAME.USER),
    validate(deleteFeedbackOrderSchema),
    feedbackController.deleteFeedbackOrderController,
  );

  app.use("/user/feedbacks", feedbackRoute);
};

export default initFeedbackRoute;
