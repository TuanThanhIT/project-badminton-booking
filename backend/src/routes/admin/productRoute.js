import express from "express";
import productController from "../../controllers/admin/productController.js";
import multer from "multer";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  createProductImagesSchema,
  createProductSchema,
  createProductVariantSchema,
  deleteProductImageSchema,
  deleteProductVariantSchema,
  getProductByIdSchema,
  getProductImagesSchema,
  getProductsSchema,
  getProductVariantByIdSchema,
  getProductVariantsByProductIdSchema,
  updateProductImageSchema,
  updateProductSchema,
  updateProductVariantSchema,
} from "../../validations/productValidation.js";

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
    validate(getProductsSchema),
    productController.getProducts,
  );
  productRoute.get(
    "/:productId",
    auth,
    authorize("ADMIN"),
    validate(getProductByIdSchema),
    productController.getProductById,
  );

  productRoute.post(
    "/add",
    auth,
    authorize("ADMIN"),
    uploader.single("file"),
    validate(createProductSchema),
    productController.createProduct,
  );

  productRoute.put(
    "/update/:productId",
    auth,
    authorize("ADMIN"),
    uploader.single("file"),
    validate(updateProductSchema),
    productController.updateProduct,
  );

  productRoute.post(
    "/:productId/variants",
    auth,
    authorize("ADMIN"),
    validate(createProductVariantSchema),
    productController.createProductVariant,
  );

  productRoute.get(
    "/:productId/variants",
    auth,
    authorize("ADMIN"),
    validate(getProductVariantsByProductIdSchema),
    productController.getProductVariantsByProductId,
  );

  productRoute.get(
    "/variant/:variantId",
    auth,
    authorize("ADMIN"),
    validate(getProductVariantByIdSchema),
    productController.getProductVariantById,
  );

  productRoute.put(
    "/variant/update/:variantId",
    auth,
    authorize("ADMIN"),
    validate(updateProductVariantSchema),
    productController.updateProductVariant,
  );

  productRoute.delete(
    "/variant/delete/:variantId",
    auth,
    authorize("ADMIN"),
    validate(deleteProductVariantSchema),
    productController.deleteProductVariant,
  );

  productRoute.post(
    "/:productId/images",
    auth,
    authorize("ADMIN"),
    uploader.array("files", 5),
    validate(createProductImagesSchema),
    productController.createProductImages,
  );

  productRoute.get(
    "/:productId/images",
    auth,
    authorize("ADMIN"),
    validate(getProductImagesSchema),
    productController.getProductImages,
  );

  productRoute.delete(
    "/images/delete/:imageId",
    auth,
    authorize("ADMIN"),
    validate(deleteProductImageSchema),
    productController.deleteProductImage,
  );

  productRoute.put(
    "/images/update/:imageId",
    auth,
    authorize("ADMIN"),
    uploader.single("image"),
    validate(updateProductImageSchema),
    productController.updateProductImage,
  );

  app.use("/admin/product", productRoute);
};

export default initProductAdminRoute;
