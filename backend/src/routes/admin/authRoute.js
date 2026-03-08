import express from "express";
import authController from "../../controllers/admin/authController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  createUserSchema,
  handleLoginSchema,
} from "../../validations/authValidation.js";

const authRoute = express.Router();

const initAdminAuthRoute = (app) => {
  authRoute.post(
    "/register",
    validate(createUserSchema),
    authController.createAdminController,
  );
  authRoute.post(
    "/login",
    validate(handleLoginSchema),
    authController.handleLogin,
  );
  authRoute.get(
    "/me",
    auth,
    authorize("ADMIN"),
    authController.getAdminAccount,
  );
  app.use("/admin/auth", authRoute);
};
export default initAdminAuthRoute;
