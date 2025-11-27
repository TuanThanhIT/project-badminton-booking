import express from "express";
import categoryCustomerController from "../../controllers/customer/categoryController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const cateRoute = express.Router();

const initCateCustomerRoute = (app) => {
  cateRoute.get(
    "/list/:group_name",
    auth,
    authorize("USER"),
    categoryCustomerController.getCatesByGroupName
  );
  cateRoute.get("/list", categoryCustomerController.getCategoriesByGroupName);
  cateRoute.get(
    "/list/other/:cate_id",
    auth,
    authorize("USER"),
    categoryCustomerController.getOtherCategoriesByGroupName
  );
  cateRoute.get("/group/list", categoryCustomerController.getAllGroupName);
  app.use("/user/category", cateRoute);
};
export default initCateCustomerRoute;
