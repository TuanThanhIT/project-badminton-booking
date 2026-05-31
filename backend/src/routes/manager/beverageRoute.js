import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import beverageController from "../../controllers/manager/beverageController.js";

const beverageRoute = express.Router();

const initBeverageRoute = (app) => {
  beverageRoute.get(
    "/",
    auth,
    authorize("MANAGER"),
    beverageController.getBeveragesController,
  );

  beverageRoute.patch(
    "/:beverageId/stock",
    auth,
    authorize("MANAGER"),
    beverageController.updateBeverageStockController,
  );

  app.use("/manager/beverages", beverageRoute);
};

export default initBeverageRoute;
