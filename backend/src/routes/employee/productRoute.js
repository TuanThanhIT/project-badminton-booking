import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import productController from "../../controllers/employee/productController.js";

const productRoute = express.Router();

const initProductEmployeeRoute = (app) => {
  productRoute.get(
    "/list",
    auth,
    authorize("EMPLOYEE"),
    productController.getProducts
  );
  app.use("/employee/product", productRoute);
};
export default initProductEmployeeRoute;
