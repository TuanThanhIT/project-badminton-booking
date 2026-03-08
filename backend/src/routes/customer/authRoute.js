import express from "express";
import authController from "../../controllers/customer/authController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  createUserSchema,
  handleLoginSchema,
  resetPasswordSchema,
  sendVerifyOtpSchema,
  verifyOtpSchema,
} from "../../validations/authValidation.js";

const authRoute = express.Router();

const initAuthRoute = (app) => {
  authRoute.post(
    "/register",
    validate(createUserSchema),
    authController.createUser,
  );
  authRoute.post(
    "/verify-account",
    validate(verifyOtpSchema),
    authController.verifyUserOtp,
  );
  authRoute.post(
    "/send-otp",
    validate(sendVerifyOtpSchema),
    authController.sendVerifyOtp,
  );
  authRoute.post(
    "/password/reset",
    validate(resetPasswordSchema),
    authController.resetPassword,
  );
  authRoute.post(
    "/login",
    validate(handleLoginSchema),
    authController.handleLogin,
  );
  authRoute.get("/me", auth, authorize("USER"), authController.getAccount);
  app.use("/user/auth", authRoute);
};
export default initAuthRoute;
