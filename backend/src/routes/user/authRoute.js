import express from "express";
import authController from "../../controllers/user/authController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  handleLoginSchema,
  handleRegisterSchema,
  resetPasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from "../../validations/authValidation.js";

const authRoute = express.Router();

const initAuthRoute = (app) => {
  authRoute.post(
    "/register",
    validate(handleRegisterSchema),
    authController.handleRegisterController,
  );
  authRoute.post(
    "/verify-account",
    validate(verifyOtpSchema),
    authController.verifyOtpController,
  );
  authRoute.post(
    "/send-otp",
    validate(sendOtpSchema),
    authController.sendOtpController,
  );
  authRoute.post(
    "/reset-password",
    validate(resetPasswordSchema),
    authController.resetPasswordController,
  );
  authRoute.post(
    "/login",
    validate(handleLoginSchema),
    authController.handleLoginController,
  );
  authRoute.get(
    "/me",
    auth,
    authorize("User"),
    authController.getAccountController,
  );
  app.use("/user/auth", authRoute);
};
export default initAuthRoute;
