import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import adminProductController from "../../controllers/admin/productController.js";

const adminProductRoute = express.Router();

const initAdminProductRoute = (app) => {
  adminProductRoute.get("/categories", auth, authorize(ROLE_NAME.ADMIN), adminProductController.getCategoriesController);
  adminProductRoute.get("/", auth, authorize(ROLE_NAME.ADMIN), adminProductController.getProductsController);
  adminProductRoute.get("/:productId", auth, authorize(ROLE_NAME.ADMIN), adminProductController.getProductDetailController);
  adminProductRoute.post("/", auth, authorize(ROLE_NAME.ADMIN), adminProductController.createProductController);
  adminProductRoute.put("/:productId", auth, authorize(ROLE_NAME.ADMIN), adminProductController.updateProductController);
  adminProductRoute.delete("/:productId", auth, authorize(ROLE_NAME.ADMIN), adminProductController.deleteProductController);

  app.use("/admin/products", adminProductRoute);
};

export default initAdminProductRoute;
