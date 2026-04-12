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

const walletRoute = express.Router();

const initWalletRoute = (app) => {
  walletRoute.post(
    "/deposit",
    auth,
    authorize("USER"),
    validate(walletDepositSchema),
    walletController.walletDepositController,
  );
  walletRoute.patch(
    "/vnpay/callback",
    auth,
    authorize("USER"),
    validate(walletCallbackSchema),
    walletController.walletCallbackController,
  );
  walletRoute.post(
    "/withdraw",
    auth,
    authorize("USER"),
    validate(walletWithdrawRequestSchema),
    walletController.walletWithdrawRequestController,
  );
  walletRoute.patch(
    "/withdraw/confirm",
    auth,
    authorize("USER"),
    validate(walletWithdrawConfirmSchema),
    walletController.walletWithdrawConfirmController,
  );
  app.use("/user/wallet", walletRoute);
};

export default initWalletRoute;
