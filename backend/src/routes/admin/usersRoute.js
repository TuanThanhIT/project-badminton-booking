import express from "express";
import usersController from "../../controllers/admin/usersController.js";
import auth from "../../middlewares/auth.js";
const authRoute = express.Router();
const initAdminAuthRoute = (app) => {
  authRoute.post("/createUsers", usersController.createUserController);
  app.use("/admin/users", auth, authRoute);
};
export default initAdminAuthRoute;
