import express from "express";
import authController from "../../controllers/admin/authController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const authRoute = express.Router();

const initAdminAuthRoute = (app) => {
  authRoute.post("/register", authController.createAdminController);
  authRoute.post("/login", authController.handleLogin);
  authRoute.get(
    "/account",
    auth,
    authorize("ADMIN"),
    authController.getAdminAccount
  );
  app.use("/admin/auth", authRoute);
};
export default initAdminAuthRoute;
