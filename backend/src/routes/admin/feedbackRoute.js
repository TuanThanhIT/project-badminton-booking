import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import adminFeedbackController from "../../controllers/admin/feedbackController.js";

const adminFeedbackRoute = express.Router();

const initAdminFeedbackRoute = (app) => {
  adminFeedbackRoute.get("/", auth, authorize(ROLE_NAME.ADMIN), adminFeedbackController.getFeedbacksController);
  adminFeedbackRoute.delete("/:feedbackId", auth, authorize(ROLE_NAME.ADMIN), adminFeedbackController.deleteFeedbackController);

  app.use("/admin/feedbacks", adminFeedbackRoute);
};

export default initAdminFeedbackRoute;
