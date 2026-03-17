import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  getProductDetailSchema,
  getProductsByFilterSchema,
} from "../../validations/productValidation.js";
import productController from "../../controllers/user/productController.js";

const productRoute = express.Router();

const initProductRoute = (app) => {
  productRoute.get(
    "/",
    auth,
    authorize("User"),
    validate(getProductsByFilterSchema),
    productController.getProductsByFilterController,
  );
  productRoute.get(
    "/:productId",
    auth,
    authorize("User"),
    validate(getProductDetailSchema),
    productController.getProductDetailController,
  );
  app.use("/user/products", productRoute);
};
export default initProductRoute;
