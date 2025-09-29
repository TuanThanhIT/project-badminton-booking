import express from "express";
import categoryCustomerController from "../../controllers/customer/categoryController.js";

const cateRoute = express.Router();

const initCateCustomerRoute = (app) => {
  cateRoute.get("/list", categoryCustomerController.getCategoriesByGroupName);
  cateRoute.get(
    "/list/other/:cate_id",
    categoryCustomerController.getOtherCategoriesByGroupName
  );
  app.use("/user/category", cateRoute);
};
export default initCateCustomerRoute;
