import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import adminProductController from "../../controllers/admin/productController.js";

const adminProductRoute = express.Router();

const initAdminProductRoute = (app) => {
  adminProductRoute.get("/categories", auth, authorize(ROLE_NAME.ADMIN), adminProductController.getCategoriesController);
  adminProductRoute.get("/stock-branches", auth, authorize(ROLE_NAME.ADMIN), adminProductController.getStockBranchesController);
  adminProductRoute.get("/", auth, authorize(ROLE_NAME.ADMIN), adminProductController.getProductsController);
  adminProductRoute.get("/:productId/images", auth, authorize(ROLE_NAME.ADMIN), adminProductController.getProductImagesController);
  adminProductRoute.post("/:productId/images", auth, authorize(ROLE_NAME.ADMIN), adminProductController.createProductImagesController);
  adminProductRoute.put("/images/:imageId", auth, authorize(ROLE_NAME.ADMIN), adminProductController.updateProductImageController);
  adminProductRoute.delete("/images/:imageId", auth, authorize(ROLE_NAME.ADMIN), adminProductController.deleteProductImageController);
  adminProductRoute.get("/:productId/variants", auth, authorize(ROLE_NAME.ADMIN), adminProductController.getProductVariantsController);
  adminProductRoute.post("/:productId/variants", auth, authorize(ROLE_NAME.ADMIN), adminProductController.createProductVariantController);
  adminProductRoute.put("/variants/:variantId", auth, authorize(ROLE_NAME.ADMIN), adminProductController.updateProductVariantController);
  adminProductRoute.delete("/variants/:variantId", auth, authorize(ROLE_NAME.ADMIN), adminProductController.deleteProductVariantController);
  adminProductRoute.get("/:productId", auth, authorize(ROLE_NAME.ADMIN), adminProductController.getProductDetailController);
  adminProductRoute.post("/", auth, authorize(ROLE_NAME.ADMIN), adminProductController.createProductController);
  adminProductRoute.put("/:productId", auth, authorize(ROLE_NAME.ADMIN), adminProductController.updateProductController);
  adminProductRoute.delete("/:productId", auth, authorize(ROLE_NAME.ADMIN), adminProductController.deleteProductController);

  app.use("/admin/products", adminProductRoute);
};

export default initAdminProductRoute;
