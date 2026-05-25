import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import adminCategoryController from "../../controllers/admin/categoryController.js";

const adminCategoryRoute = express.Router();

const initAdminCategoryRoute = (app) => {
  adminCategoryRoute.get("/", auth, authorize(ROLE_NAME.ADMIN), adminCategoryController.getCategoriesController);
  adminCategoryRoute.post("/", auth, authorize(ROLE_NAME.ADMIN), adminCategoryController.createCategoryController);
  adminCategoryRoute.put("/:categoryId", auth, authorize(ROLE_NAME.ADMIN), adminCategoryController.updateCategoryController);
  adminCategoryRoute.delete("/:categoryId", auth, authorize(ROLE_NAME.ADMIN), adminCategoryController.deleteCategoryController);

  app.use("/admin/categories", adminCategoryRoute);
};

export default initAdminCategoryRoute;
