import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import adminBeverageController from "../../controllers/admin/beverageController.js";

const adminBeverageRoute = express.Router();

const initAdminBeverageRoute = (app) => {
  adminBeverageRoute.get("/", auth, authorize(ROLE_NAME.ADMIN), adminBeverageController.getBeveragesController);
  adminBeverageRoute.post("/", auth, authorize(ROLE_NAME.ADMIN), adminBeverageController.createBeverageController);
  adminBeverageRoute.put("/:beverageId", auth, authorize(ROLE_NAME.ADMIN), adminBeverageController.updateBeverageController);
  adminBeverageRoute.delete("/:beverageId", auth, authorize(ROLE_NAME.ADMIN), adminBeverageController.deleteBeverageController);
  adminBeverageRoute.get("/:beverageId/stocks", auth, authorize(ROLE_NAME.ADMIN), adminBeverageController.getBeverageStocksController);

  app.use("/admin/beverages", adminBeverageRoute);
};

export default initAdminBeverageRoute;
