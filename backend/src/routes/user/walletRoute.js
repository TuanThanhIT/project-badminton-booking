import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import walletController from "../../controllers/user/walletController.js";
import {
  walletCallbackSchema,
  walletDepositSchema,
  walletWithdrawConfirmSchema,
  walletWithdrawRequestSchema,
} from "../../validations/walletValidation.js";
import validate from "../../middlewares/validate.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const walletRoute = express.Router();

const initWalletRoute = (app) => {
  walletRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.USER),
    walletController.getWalletOverviewController,
  );

  walletRoute.post(
    "/deposit",
    auth,
    authorize(ROLE_NAME.USER),
    validate(walletDepositSchema),
    walletController.walletDepositController,
  );
  walletRoute.patch(
    "/vnpay/callback",
    auth,
    authorize(ROLE_NAME.USER),
    validate(walletCallbackSchema),
    walletController.walletCallbackController,
  );
  walletRoute.post(
    "/withdraw",
    auth,
    authorize(ROLE_NAME.USER),
    validate(walletWithdrawRequestSchema),
    walletController.walletWithdrawRequestController,
  );
  walletRoute.patch(
    "/withdraw/confirm",
    auth,
    authorize(ROLE_NAME.USER),
    validate(walletWithdrawConfirmSchema),
    walletController.walletWithdrawConfirmController,
  );
  app.use("/user/wallet", walletRoute);
};

export default initWalletRoute;
