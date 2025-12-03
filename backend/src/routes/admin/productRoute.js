import express from "express";
import productController from "../../controllers/admin/productController.js";
import multer from "multer";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const productRoute = express.Router();

var uploader = multer({
  storage: multer.memoryStorage({}),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const initProductAdminRoute = (app) => {
  // L?y t?t c? product
  productRoute.get("/", productController.getProductsWithPage);
  productRoute.get("/:productId", productController.getProductById); // L?y 1 s?n ph?m theo ID

  // T?o product (thumbnail)
  productRoute.post(
    "/add",
uploader.single("thumbnail"),
    auth,
    authorize(),
    uploader.single("file"),
    productController.createProduct
  );
  // C?p nh?t product
  productRoute.put(
    "/:productId",
    uploader.single("thumbnail"),
    productController.updateProduct
  );

  // T?o variant cho product
  productRoute.post(
    "/images/add",
    auth,
    authorize(),
    uploader.array("files", 5),

    "/:productId/variants",
    productController.createProductVariant
  );
"/:productId/variants",
    productController.createProductVariant
  );
"/:productId/variants",
    productController.createProductVariant
  );

  // L?y variant theo productId
  productRoute.get(
    "/:productId/variants",
    productController.getProductVariantsByProductId
  );

  // T?o images cho product
  productRoute.post(
    "/:productId/images",
    uploader.array("images", 5),
  // L?y variant theo productId
  productRoute.get(
    "/:productId/variants",
    productController.getProductVariantsByProductId
  );

  // T?o images cho product
  productRoute.post(
    "/:productId/images",
    uploader.array("images", 5),
    productController.createProductImages
  );
  app.use("/admin/product", productRoute);
  // app.use("/admin/product", auth, productRoute);
  app.use("/admin/product", productRoute);
};

export default initProductAdminRoute;
