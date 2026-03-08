import express from "express";
import roleController from "../../controllers/admin/roleController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { createRoleSchema } from "../../validations/roleValidation.js";
import validate from "../../middlewares/validate.js";

const roleRoute = express.Router();

const initRoleRoute = (app) => {
  roleRoute.post(
    "/add",
    auth,
    authorize("ADMIN"),
    validate(createRoleSchema),
    roleController.createRole,
  );
  app.use("/admin/roles", roleRoute);
};
export default initRoleRoute;
