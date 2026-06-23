import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import adminUserController from "../../controllers/admin/userController.js";
import validate from "../../middlewares/validate.js";
import { userModerationViolationsSchema } from "../../validations/adminModerationValidation.js";

const adminUserRoute = express.Router();

const initAdminUserRoute = (app) => {
  adminUserRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminUserController.getUsersController,
  );

  adminUserRoute.get(
    "/:userId",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminUserController.getUserDetailController,
  );

  adminUserRoute.get(
    "/:userId/moderation-violations",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(userModerationViolationsSchema),
    adminUserController.getUserModerationViolationsController,
  );

  adminUserRoute.put(
    "/:userId/toggle-active",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminUserController.toggleUserActiveController,
  );

  adminUserRoute.post(
    "/create-manager",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminUserController.createManagerController,
  );

  adminUserRoute.delete(
    "/:userId",
    auth,
    authorize(ROLE_NAME.ADMIN),
    adminUserController.deleteManagerController,
  );

  app.use("/admin/users", adminUserRoute);
};

export default initAdminUserRoute;
