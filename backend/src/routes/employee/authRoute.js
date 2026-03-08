import express from "express";
import authController from "../../controllers/employee/authController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { handleLoginSchema } from "../../validations/authValidation.js";
import validate from "../../middlewares/validate.js";

const authRoute = express.Router();

const initAuthEmployeeRoute = (app) => {
  authRoute.post(
    "/login",
    validate(handleLoginSchema),
    authController.handleLogin,
  );
  authRoute.get(
    "/account",
    auth,
    authorize("EMPLOYEE"),
    authController.getEmployeeAccount,
  );
  app.use("/employee/auth", authRoute);
};
export default initAuthEmployeeRoute;
