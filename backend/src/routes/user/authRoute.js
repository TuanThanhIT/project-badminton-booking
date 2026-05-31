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
  verifyResetOtpSchema,
} from "../../validations/authValidation.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

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
    "/reset-password/verify-otp",
    validate(verifyResetOtpSchema),
    authController.verifyResetOtpController,
  );
  authRoute.post(
    "/reset-password",
    validate(resetPasswordSchema),
    authController.resetPasswordController,
  );
  authRoute.post("/refresh-token", authController.refreshTokenController);
  authRoute.post(
    "/login",
    validate(handleLoginSchema),
    authController.handleLoginController,
  );
  app.post(
    "/admin/auth/login",
    validate(handleLoginSchema),
    authController.handleAdminLoginController,
  );
  app.post(
    "/manager/auth/login",
    validate(handleLoginSchema),
    authController.handleManagerLoginController,
  );
  app.post(
    "/employee/auth/login",
    validate(handleLoginSchema),
    authController.handleEmployeeLoginController,
  );
  authRoute.get(
    "/me",
    auth,
    authorize(
      ROLE_NAME.USER,
      ROLE_NAME.MANAGER,
      ROLE_NAME.EMPLOYEE,
      ROLE_NAME.COACH,
    ),
    authController.getAccountController,
  );
  authRoute.post("/logout", authController.logoutController);
  app.use("/user/auth", authRoute);
};
export default initAuthRoute;
