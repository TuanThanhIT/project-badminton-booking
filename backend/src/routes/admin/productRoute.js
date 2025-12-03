import express from "express";
import productController from "../../controllers/admin/productController.js";
import multer from "multer";
import auth from "../../middlewares/auth.js";

const productRoute = express.Router();

var uploader = multer({
  storage: multer.memoryStorage({}),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const initProductAdminRoute = (app) => {
  // Lấy tất cả product
  productRoute.get("/", productController.getProductsWithPage);
  productRoute.get("/:productId", productController.getProductById); // Lấy 1 sản phẩm theo ID

  // Tạo product (thumbnail)
  productRoute.post(
    "/add",
    uploader.single("thumbnail"),
    productController.createProduct
  );
  // Cập nhật product
  productRoute.put(
    "/:productId",
    uploader.single("thumbnail"),
    productController.updateProduct
  );

  // Tạo variant cho product
  productRoute.post(
    "/:productId/variants",
    productController.createProductVariant
  );

  // Lấy variant theo productId
  productRoute.get(
    "/:productId/variants",
    productController.getProductVariantsByProductId
  );

  // Tạo images cho product
  productRoute.post(
    "/:productId/images",
    uploader.array("images", 5),
    productController.createProductImages
  );

  // app.use("/admin/product", auth, productRoute);
  app.use("/admin/product", productRoute);
};

export default initProductAdminRoute;
