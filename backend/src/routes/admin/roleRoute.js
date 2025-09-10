import express from "express";
import roleController from "../../controllers/admin/roleController.js";
const roleRoute = express.Router();

const initRoleRoute = (app) => {
  roleRoute.post("/add", roleController.createRole);
  app.use("/admin/roles", roleRoute);
};
export default initRoleRoute;
