import express from "express";
import categoryAdminController from "../../controllers/admin/categoryController.js";

const cateRoute = express.Router();

const initCateAdminRoute = (app) => {
  cateRoute.post("/add", categoryAdminController.createCategory);
  app.use("/admin/category", cateRoute);
};
export default initCateAdminRoute;
