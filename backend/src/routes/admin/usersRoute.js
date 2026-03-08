import express from "express";
import usersController from "../../controllers/admin/usersController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  createUserSchema,
  getUsersByRoleSchema,
  lockUserSchema,
  unlockUserSchema,
} from "../../validations/userValidation.js";

const usersRoute = express.Router();
const initUserAdminAuthRoute = (app) => {
  usersRoute.post(
    "/add",
    auth,
    authorize("ADMIN"),
    validate(createUserSchema),
    usersController.createUser,
  );
  usersRoute.put(
    "/lock/:userId",
    auth,
    authorize("ADMIN"),
    validate(lockUserSchema),
    usersController.lockUser,
  );
  usersRoute.put(
    "/unlock/:userId",
    auth,
    authorize("ADMIN"),
    validate(unlockUserSchema),
    usersController.unlockUser,
  );
  usersRoute.get("/", auth, authorize("ADMIN"), usersController.getAllUsers);
  usersRoute.get(
    "/role/:roleId",
    auth,
    authorize("ADMIN"),
    validate(getUsersByRoleSchema),
    usersController.getUsersByRole,
  );
  usersRoute.get(
    "/employees",
    auth,
    authorize("ADMIN"),
    usersController.getAllEmployees,
  );

  app.use("/admin/users", usersRoute);
};
export default initUserAdminAuthRoute;
