import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import purchaseReceiptController from "../../controllers/admin/purchaseReceiptController.js";

const purchaseReceiptRoute = express.Router();

const initPurchaseReceiptRoute = (app) => {
  purchaseReceiptRoute.get("/", auth, authorize(ROLE_NAME.ADMIN), purchaseReceiptController.getPurchaseReceiptsController);
  purchaseReceiptRoute.get("/:receiptId", auth, authorize(ROLE_NAME.ADMIN), purchaseReceiptController.getPurchaseReceiptDetailController);
  purchaseReceiptRoute.patch("/:receiptId/approve", auth, authorize(ROLE_NAME.ADMIN), purchaseReceiptController.approvePurchaseReceiptController);
  purchaseReceiptRoute.patch("/:receiptId/reject", auth, authorize(ROLE_NAME.ADMIN), purchaseReceiptController.rejectPurchaseReceiptController);

  app.use("/admin/purchase-receipts", purchaseReceiptRoute);
};

export default initPurchaseReceiptRoute;
