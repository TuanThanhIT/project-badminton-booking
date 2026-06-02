import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import supplierController from "../../controllers/manager/supplierController.js";

const supplierRoute = express.Router();

const initSupplierRoute = (app) => {
  supplierRoute.get("/", auth, authorize(ROLE_NAME.MANAGER), supplierController.getSuppliersController);

  app.use("/manager/suppliers", supplierRoute);
};

export default initSupplierRoute;
