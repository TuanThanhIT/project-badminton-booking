import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import adminFinanceController from "../../controllers/admin/financeController.js";

const adminFinanceRoute = express.Router();

const initAdminFinanceRoute = (app) => {
  // GET
  adminFinanceRoute.get("/stats",        auth, authorize(ROLE_NAME.ADMIN), adminFinanceController.getFinanceStatsController);
  adminFinanceRoute.get("/transactions", auth, authorize(ROLE_NAME.ADMIN), adminFinanceController.getWalletTransactionsController);
  adminFinanceRoute.get("/withdraws",    auth, authorize(ROLE_NAME.ADMIN), adminFinanceController.getWithdrawRequestsController);
  adminFinanceRoute.get("/wallets",      auth, authorize(ROLE_NAME.ADMIN), adminFinanceController.getUserWalletsController);

  // PATCH – xử lý rút tiền (P0)
  adminFinanceRoute.patch("/withdraws/:id/approve", auth, authorize(ROLE_NAME.ADMIN), adminFinanceController.approveWithdrawRequestController);
  adminFinanceRoute.patch("/withdraws/:id/reject",  auth, authorize(ROLE_NAME.ADMIN), adminFinanceController.rejectWithdrawRequestController);

  // PATCH – trạng thái ví (P1)
  adminFinanceRoute.patch("/wallets/:id/status", auth, authorize(ROLE_NAME.ADMIN), adminFinanceController.toggleWalletStatusController);

  app.use("/admin/finance", adminFinanceRoute);
};

export default initAdminFinanceRoute;
