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
    authorize("User"),
    validate(walletDepositSchema),
    walletController.walletDepositController,
  );
  walletRoute.patch(
    "/vnpay/callback",
    auth,
    authorize("User"),
    validate(walletCallbackSchema),
    walletController.walletCallbackController,
  );
  walletRoute.post(
    "/withdraw",
    auth,
    authorize("User"),
    validate(walletWithdrawRequestSchema),
    walletController.walletWithdrawRequestController,
  );
  walletRoute.patch(
    "/withdraw/confirm",
    auth,
    authorize("User"),
    validate(walletWithdrawConfirmSchema),
    walletController.walletWithdrawConfirmController,
  );
  app.use("/user/wallet", walletRoute);
};

export default initWalletRoute;
