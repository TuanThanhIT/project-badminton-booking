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
  // L?y t?t c? product
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
  ); // L?y 1 s?n ph?m theo ID

  // T?o product (thumbnail)
  productRoute.post(
    "/add",
    auth,
    authorize("ADMIN"),
    uploader.single("thumbnail"),
    productController.createProduct
  );
  // C?p nh?t product
  productRoute.put(
    "/:productId",
    auth,
    authorize("ADMIN"),
    uploader.single("thumbnail"),
    productController.updateProduct
  );

  // T?o variant cho product
  productRoute.post(
    "/:productId/variants",
    auth,
    authorize("ADMIN"),
    productController.createProductVariant
  );

  // L?y variant theo productId
  productRoute.get(
    "/:productId/variants",
    auth,
    authorize("ADMIN"),
    productController.getProductVariantsByProductId
  );

  // Lấy 1 variant
  productRoute.get(
    "/variant/:variantId",
    auth,
    authorize("ADMIN"),
    productController.getProductVariantById
  );

  // Cập nhật variant
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

  // Thêm nhiều ảnh cho product
  productRoute.post(
    "/:productId/images",
    auth,
    authorize("ADMIN"),
    uploader.array("images", 5),
    productController.createProductImages
  );
  // Lấy ảnh theo productId
  productRoute.get("/:productId/images", productController.getProductImages);
  productRoute.delete("/images/:imageId", productController.deleteProductImage);
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
