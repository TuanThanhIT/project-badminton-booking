import express from "express";
import productCustomerController from "../../controllers/customer/productController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const productRoute = express.Router();

const initProductCustomerRoute = (app) => {
  productRoute.get(
    "/list",
    auth,
    authorize("USER"),
    productCustomerController.getProductsByFilter
  );
  productRoute.get(
    "/group/list",
    productCustomerController.getProductsByGroupNameAndFilter
  );
  productRoute.get(
    "/:id",
    auth,
    authorize("USER"),
    productCustomerController.getProductDetail
  );
  app.use("/user/product", productRoute);
};
export default initProductCustomerRoute;
