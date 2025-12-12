import express from "express";
import categoryAdminController from "../../controllers/admin/categoryController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const cateRoute = express.Router();

const initCateAdminRoute = (app) => {
  cateRoute.post("/add", categoryAdminController.createCategory);
  cateRoute.get("/", categoryAdminController.getCategories);
  cateRoute.put("/edit/:id", categoryAdminController.updateCategory);
  cateRoute.get("/list", categoryAdminController.getListCategory);
  app.use("/admin/category", cateRoute);
};
export default initCateAdminRoute;
