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
import imageSearchUpload from "../../middlewares/uploadImageSearch.js";

const productRoute = express.Router();

const initProductRoute = (app) => {
  productRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(getProductsByFilterSchema),
    productController.getProductsByFilterController,
  );
  productRoute.post(
    "/image-search",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    imageSearchUpload.single("image"),
    productController.searchProductsByImageController,
  );
  productRoute.get(
    "/:productId",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(getProductDetailSchema),
    productController.getProductDetailController,
  );
  productRoute.get(
    "/feedbacks/:productId",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(getProductFeedbacksSchema),
    productController.getProductFeedbacksController,
  );
  app.use("/user/products", productRoute);
};
export default initProductRoute;
