import express from "express";
import productFeedbackController from "../../controllers/customer/productFeedbackController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const productFeedbackRoute = express.Router();

const initProductFeedbackCustomerRoute = (app) => {
  productFeedbackRoute.post(
    "/feedback/:id",
    auth,
    authorize("USER"),
    productFeedbackController.createProductFeedback
  );
  productFeedbackRoute.patch(
    "/feedback/:id",
    auth,
    authorize("USER"),
    productFeedbackController.updateFeedback
  );
  productFeedbackRoute.get(
    "/feedback/update/:id",
    auth,
    authorize("USER"),
    productFeedbackController.getFeedbackUpdate
  );
  productFeedbackRoute.get(
    "/feedback/:id",
    auth,
    authorize("USER"),
    productFeedbackController.getFeedbackProduct
  );
  app.use("/user/product", productFeedbackRoute);
};
export default initProductFeedbackCustomerRoute;
