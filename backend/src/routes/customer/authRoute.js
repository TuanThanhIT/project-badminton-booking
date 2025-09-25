import express from "express";
import authController from "../../controllers/customer/authController.js";
import auth from "../../middlewares/auth.js";

const authRoute = express.Router();

const initAuthRoute = (app) => {
  authRoute.post("/register", authController.createUser);
  authRoute.post("/verify-otp", authController.verifyUserOtp);
  authRoute.post("/sent-otp", authController.sentVerifyUserOtp);
  authRoute.post("/login", authController.userLogin);
  authRoute.get("/account", authController.getAccount);
  app.use("/auth", auth, authRoute);
};
export default initAuthRoute;
