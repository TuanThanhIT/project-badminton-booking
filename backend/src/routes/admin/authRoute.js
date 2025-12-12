import express from "express";
import authController from "../../controllers/admin/authController.js";
import auth from "../../middlewares/auth.js";
const authRoute = express.Router();
const initAdminAuthRoute = (app) => {
  authRoute.post("/register", authController.createAdminController);
  app.use("/admin/auth", auth, authRoute);
};
export default initAdminAuthRoute;
