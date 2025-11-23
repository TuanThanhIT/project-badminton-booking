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
  productRoute.get("/", productController.getAllProducts);

  // Tạo product (thumbnail)
  productRoute.post(
    "/",
    uploader.single("thumbnail"),
    productController.createProduct
  );

  // Tạo varient cho product
  productRoute.post(
    "/:productId/varients",
    productController.createProductVarient
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
