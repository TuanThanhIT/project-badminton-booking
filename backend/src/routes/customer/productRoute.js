import express from "express";
import productCustomerController from "../../controllers/customer/productController.js";

const productRoute = express.Router();

const initProductCustomerRoute = (app) => {
  productRoute.get("/list", productCustomerController.getProductsByFilter);
  productRoute.get("/:id", productCustomerController.getProductDetail);
  app.use("/user/product", productRoute);
};
export default initProductCustomerRoute;
