import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import inventoryController from "../../controllers/manager/inventoryController.js";

const inventoryRoute = express.Router();

const initInventoryRoute = (app) => {
  inventoryRoute.get("/variant-stocks", auth, authorize(ROLE_NAME.MANAGER), inventoryController.getVariantStocksController);
  inventoryRoute.get("/beverage-stocks", auth, authorize(ROLE_NAME.MANAGER), inventoryController.getBeverageStocksController);
  inventoryRoute.get("/stock-transactions", auth, authorize(ROLE_NAME.MANAGER), inventoryController.getStockTransactionsController);
  inventoryRoute.get("/variant-stocks/:variantId/history", auth, authorize(ROLE_NAME.MANAGER), inventoryController.getVariantStockHistoryController);
  inventoryRoute.get("/beverage-stocks/:beverageId/history", auth, authorize(ROLE_NAME.MANAGER), inventoryController.getBeverageStockHistoryController);

  app.use("/manager", inventoryRoute);
};

export default initInventoryRoute;
