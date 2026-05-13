import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  getProductDetailSchema,
  getProductFeedbacksSchema,
  getProductsByFilterSchema,
} from "../../validations/productValidation.js";
import productController from "../../controllers/user/productController.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const productRoute = express.Router();

const initProductRoute = (app) => {
  productRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.USER),
    validate(getProductsByFilterSchema),
    productController.getProductsByFilterController,
  );
  productRoute.get(
    "/:productId",
    auth,
    authorize(ROLE_NAME.USER),
    validate(getProductDetailSchema),
    productController.getProductDetailController,
  );
  productRoute.get(
    "/feedbacks/:productId",
    auth,
    authorize(ROLE_NAME.USER),
    validate(getProductFeedbacksSchema),
    productController.getProductFeedbacksController,
  );
  app.use("/user/products", productRoute);
};
export default initProductRoute;
