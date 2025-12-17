import express from "express";
import usersController from "../../controllers/admin/usersController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const usersRoute = express.Router();
const initUserAdminAuthRoute = (app) => {
<<<<<<< HEAD
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
=======
  usersRoute.post("/createUsers", usersController.createUserController);
  usersRoute.put("/lock/:userId", usersController.lockUserController);
  usersRoute.put("/unlock/:userId", usersController.unlockUserController);
  usersRoute.get("/", usersController.getAllUsersController);
  usersRoute.get("/role/:roleId", usersController.getUsersByRoleController);
  usersRoute.get("/employees", usersController.getAllEmployees);
>>>>>>> dev_admin_thaitoan

  app.use("/admin/users", usersRoute);
};
export default initUserAdminAuthRoute;
