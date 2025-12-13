import express from "express";
import categoryAdminController from "../../controllers/admin/categoryController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const cateRoute = express.Router();

const initCateAdminRoute = (app) => {
  cateRoute.post(
    "/add",
    auth,
    authorize("ADMIN"),
    categoryAdminController.createCategory
  );
  cateRoute.get(
    "/",
    auth,
    authorize("ADMIN"),
    categoryAdminController.getCategories
  );
  cateRoute.put(
    "/edit/:id",
    auth,
    authorize("ADMIN"),
    categoryAdminController.updateCategory
  );
  cateRoute.get(
    "/list",
    auth,
    authorize("ADMIN"),
    categoryAdminController.getListCategory
  );
  app.use("/admin/category", cateRoute);
};
export default initCateAdminRoute;
