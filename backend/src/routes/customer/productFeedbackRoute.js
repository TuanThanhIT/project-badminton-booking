import express from "express";
import productFeedbackController from "../../controllers/customer/productFeedbackController.js";

const productFeedbackRoute = express.Router();

const initProductFeedbackCustomerRoute = (app) => {
  productFeedbackRoute.post(
    "/feedback/:id",
    productFeedbackController.createProductFeedback
  );
  productFeedbackRoute.patch(
    "/feedback/:id",
    productFeedbackController.updateFeedback
  );
  productFeedbackRoute.get(
    "/feedback/:id",
    productFeedbackController.getFeedbackUpdate
  );
  app.use("/user/product", productFeedbackRoute);
};
export default initProductFeedbackCustomerRoute;
