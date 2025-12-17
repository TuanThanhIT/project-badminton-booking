import express from "express";
import usersController from "../../controllers/admin/usersController.js";
import auth from "../../middlewares/auth.js";
const usersRoute = express.Router();
const initUserAdminAuthRoute = (app) => {
  usersRoute.post("/createUsers", usersController.createUserController);
  usersRoute.put("/lock/:userId", usersController.lockUserController);
  usersRoute.put("/unlock/:userId", usersController.unlockUserController);
  usersRoute.get("/", usersController.getAllUsersController);
  usersRoute.get("/role/:roleId", usersController.getUsersByRoleController);
  usersRoute.get("/employees", usersController.getAllEmployees);

  app.use("/admin/users", usersRoute);
};
export default initUserAdminAuthRoute;
