import express from "express";
import productController from "../../controllers/admin/productController.js";
import multer from "multer";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const productRoute = express.Router();

var uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const initProductAdminRoute = (app) => {
  productRoute.get(
    "/",
    auth,
    authorize("ADMIN"),
    productController.getProductsWithPage
  );
  productRoute.get(
    "/:productId",
    auth,
    authorize("ADMIN"),
    productController.getProductById
  );

  productRoute.post(
    "/add",
    auth,
    authorize("ADMIN"),
    uploader.single("thumbnail"),
    productController.createProduct
  );

  productRoute.put(
    "/:productId",
    auth,
    authorize("ADMIN"),
    uploader.single("thumbnail"),
    productController.updateProduct
  );

  productRoute.post(
    "/:productId/variants",
    auth,
    authorize("ADMIN"),
    productController.createProductVariant
  );

  productRoute.get(
    "/:productId/variants",
    auth,
    authorize("ADMIN"),
    productController.getProductVariantsByProductId
  );

  productRoute.get(
    "/variant/:variantId",
    auth,
    authorize("ADMIN"),
    productController.getProductVariantById
  );

  productRoute.put(
    "/variant/:variantId",
    auth,
    authorize("ADMIN"),
    productController.updateProductVariant
  );
  productRoute.delete(
    "/variant/:variantId",
    auth,
    authorize("ADMIN"),
    productController.deleteProductVariant
  );

  productRoute.post(
    "/:productId/images",
    auth,
    authorize("ADMIN"),
    uploader.array("images", 5),
    productController.createProductImages
  );

  productRoute.get(
    "/:productId/images",
    auth,
    authorize("ADMIN"),
    productController.getProductImages
  );
  productRoute.delete(
    "/images/:imageId",
    auth,
    authorize("ADMIN"),
    productController.deleteProductImage
  );
  productRoute.put(
    "/images/:imageId",
    auth,
    authorize("ADMIN"),
    uploader.single("image"),
    productController.updateProductImage
  );

  app.use("/admin/product", productRoute);
};

export default initProductAdminRoute;
