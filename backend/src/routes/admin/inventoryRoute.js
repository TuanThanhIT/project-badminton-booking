import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import inventoryController from "../../controllers/admin/inventoryController.js";

const inventoryRoute = express.Router();

const initInventoryRoute = (app) => {
  inventoryRoute.get("/variant-stocks", auth, authorize(ROLE_NAME.ADMIN), inventoryController.getVariantStocksController);
  inventoryRoute.get("/beverage-stocks", auth, authorize(ROLE_NAME.ADMIN), inventoryController.getBeverageStocksController);
  inventoryRoute.get("/stock-transactions", auth, authorize(ROLE_NAME.ADMIN), inventoryController.getStockTransactionsController);

  app.use("/admin", inventoryRoute);
};

export default initInventoryRoute;
