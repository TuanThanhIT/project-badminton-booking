import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import purchaseReceiptController from "../../controllers/manager/purchaseReceiptController.js";

const purchaseReceiptRoute = express.Router();

const initPurchaseReceiptRoute = (app) => {
  purchaseReceiptRoute.get("/", auth, authorize(ROLE_NAME.MANAGER), purchaseReceiptController.getPurchaseReceiptsController);
  purchaseReceiptRoute.post("/", auth, authorize(ROLE_NAME.MANAGER), purchaseReceiptController.createPurchaseReceiptController);
  purchaseReceiptRoute.get("/:receiptId", auth, authorize(ROLE_NAME.MANAGER), purchaseReceiptController.getPurchaseReceiptDetailController);
  purchaseReceiptRoute.patch("/:receiptId/cancel", auth, authorize(ROLE_NAME.MANAGER), purchaseReceiptController.cancelPurchaseReceiptController);

  app.use("/manager/purchase-receipts", purchaseReceiptRoute);
};

export default initPurchaseReceiptRoute;
