import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import productController from "../../controllers/manager/productController.js";

const productRoute = express.Router();

const initProductRoute = (app) => {
  app.get(
    "/manager/product-categories",
    auth,
    authorize("MANAGER"),
    productController.getProductCategoriesController,
  );

  productRoute.get(
    "/inventory",
    auth,
    authorize("MANAGER"),
    productController.getProductsController,
  );

  productRoute.get(
    "/",
    auth,
    authorize("MANAGER"),
    productController.getProductsController,
  );

  productRoute.get(
    "/:productId",
    auth,
    authorize("MANAGER"),
    productController.getProductDetailController,
  );

  app.use("/manager/products", productRoute);
};

export default initProductRoute;
