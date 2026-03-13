import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import categoryController from "../../controllers/user/cateController.js";

const cateRoute = express.Router();

const initCateRoute = (app) => {
  cateRoute.get(
    "/group/:groupName",
    auth,
    authorize("User"),
    categoryController.getCategoriesByMenuGroupController,
  );

  cateRoute.get(
    "/grouped",
    categoryController.getCategoriesGroupedByMenuGroupController,
  );

  cateRoute.get(
    "/:cateId/siblings",
    auth,
    authorize("User"),
    categoryController.getOtherCategoriesInSameGroupController,
  );

  cateRoute.get("/groups", categoryController.getAllMenuGroupsController);

  app.use("/user/categories", cateRoute);
};

export default initCateRoute;
