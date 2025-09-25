import express from "express";
import productController from "../../controllers/admin/productController.js";
import multer from "multer";
import auth from "../../middlewares/auth.js";

const productRoute = express.Router();

var uploader = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const initProductRoute = (app) => {
  productRoute.post(
    "/add",
    uploader.single("file"),
    productController.createProduct
  );
  productRoute.post("/varient/add", productController.createProductVarient);
  productRoute.post(
    "/images/add",
    uploader.array("files", 5),
    productController.createProductImages
  );
  app.use("/admin/product", auth, productRoute);
};
export default initProductRoute;
