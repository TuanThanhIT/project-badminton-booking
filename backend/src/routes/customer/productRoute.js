import express from "express";
import productCustomerController from "../../controllers/customer/productController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  getProductDetailSchema,
  getProductsByFilterSchema,
  getProductsByGroupNameAndFilterSchema,
} from "../../validations/productValidation.js";

const productRoute = express.Router();

const initProductCustomerRoute = (app) => {
  productRoute.get(
    "/list",
    auth,
    authorize("USER"),
    validate(getProductsByFilterSchema),
    productCustomerController.getProductsByFilter,
  );
  productRoute.get(
    "/group/list",
    validate(getProductsByGroupNameAndFilterSchema),
    productCustomerController.getProductsByGroupNameAndFilter,
  );
  productRoute.get(
    "/:productId",
    auth,
    authorize("USER"),
    validate(getProductDetailSchema),
    productCustomerController.getProductDetail,
  );
  app.use("/user/products", productRoute);
};
export default initProductCustomerRoute;
