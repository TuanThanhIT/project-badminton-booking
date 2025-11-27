import express from "express";
import productController from "../../controllers/admin/productController.js";
import multer from "multer";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const productRoute = express.Router();

var uploader = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const initProductAdminRoute = (app) => {
  productRoute.post(
    "/add",
    auth,
    authorize(),
    uploader.single("file"),
    productController.createProduct
  );
  productRoute.post("/varient/add", productController.createProductVarient);
  productRoute.post(
    "/images/add",
    auth,
    authorize(),
    uploader.array("files", 5),
    productController.createProductImages
  );
  app.use("/admin/product", productRoute);
};
export default initProductAdminRoute;
