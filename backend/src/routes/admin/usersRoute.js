import express from "express";
import usersController from "../../controllers/admin/usersController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const usersRoute = express.Router();
const initUserAdminAuthRoute = (app) => {
  usersRoute.post(
    "/createUsers",
    auth,
    authorize("ADMIN"),
    usersController.createUserController
  );
  usersRoute.put(
    "/lock/:userId",
    auth,
    authorize("ADMIN"),
    usersController.lockUserController
  );
  usersRoute.put(
    "/unlock/:userId",
    auth,
    authorize("ADMIN"),
    usersController.unlockUserController
  );
  usersRoute.get(
    "/",
    auth,
    authorize("ADMIN"),
    usersController.getAllUsersController
  );
  usersRoute.get(
    "/role/:roleId",
    auth,
    authorize("ADMIN"),
    usersController.getUsersByRoleController
  );
  usersRoute.get(
    "/employees",
    auth,
    authorize("ADMIN"),
    usersController.getAllEmployees
  );

  app.use("/admin/users", usersRoute);
};
export default initUserAdminAuthRoute;
