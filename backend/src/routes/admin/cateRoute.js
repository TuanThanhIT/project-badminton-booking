import express from "express";
import categoryAdminController from "../../controllers/admin/categoryController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const cateRoute = express.Router();

const initCateAdminRoute = (app) => {
  cateRoute.post(
    "/add",
    auth,
    authorize(),
    categoryAdminController.createCategory
  );
  app.use("/admin/category", cateRoute);
};
export default initCateAdminRoute;
