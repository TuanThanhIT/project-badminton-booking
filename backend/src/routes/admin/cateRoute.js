import express from "express";
import categoryController from "../../controllers/admin/categoryController.js";

const cateRoute = express.Router();

const initCateRoute = (app) => {
  cateRoute.post("/add", categoryController.createCategory);
  cateRoute.get("/list", categoryController.getCategoryByGroupName);
  app.use("/admin/category", cateRoute);
};
export default initCateRoute;
