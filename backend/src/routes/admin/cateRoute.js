import express from "express";
import categoryAdminController from "../../controllers/admin/categoryController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  createCategorySchema,
  getCategoriesSchema,
  updateCategorySchema,
} from "../../validations/cateValidation.js";

const cateRoute = express.Router();

const initCateAdminRoute = (app) => {
  cateRoute.post(
    "/add",
    auth,
    authorize("ADMIN"),
    validate(createCategorySchema),
    categoryAdminController.createCategory,
  );
  cateRoute.get(
    "/",
    auth,
    authorize("ADMIN"),
    validate(getCategoriesSchema),
    categoryAdminController.getCategories,
  );
  cateRoute.put(
    "/edit/:cateId",
    auth,
    authorize("ADMIN"),
    validate(updateCategorySchema),
    categoryAdminController.updateCategory,
  );
  cateRoute.get(
    "/list",
    auth,
    authorize("ADMIN"),
    categoryAdminController.getListCategory,
  );
  app.use("/admin/category", cateRoute);
};
export default initCateAdminRoute;
