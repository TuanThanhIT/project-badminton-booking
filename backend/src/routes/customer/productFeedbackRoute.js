import express from "express";
import productFeedbackController from "../../controllers/customer/productFeedbackController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  createFeedbackSchema,
  getFeedbackUpdateSchema,
  getProductFeedbackSchema,
  updateFeedbackSchema,
} from "../../validations/productFeedbackValidation.js";

const productFeedbackRoute = express.Router();

const initProductFeedbackCustomerRoute = (app) => {
  productFeedbackRoute.post(
    "/feedback/:orderDetailId",
    auth,
    authorize("USER"),
    validate(createFeedbackSchema),
    productFeedbackController.createProductFeedback,
  );
  productFeedbackRoute.patch(
    "/feedback/:orderDetailId",
    auth,
    authorize("USER"),
    validate(updateFeedbackSchema),
    productFeedbackController.updateFeedback,
  );
  productFeedbackRoute.get(
    "/feedback/update/:orderDetailId",
    auth,
    authorize("USER"),
    validate(getFeedbackUpdateSchema),
    productFeedbackController.getFeedbackUpdate,
  );
  productFeedbackRoute.get(
    "/feedback/:productId",
    auth,
    authorize("USER"),
    validate(getProductFeedbackSchema),
    productFeedbackController.getProductFeedback,
  );
  app.use("/user/product", productFeedbackRoute);
};
export default initProductFeedbackCustomerRoute;
