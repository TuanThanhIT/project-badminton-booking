import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import supplierController from "../../controllers/admin/supplierController.js";

const supplierRoute = express.Router();

const initSupplierRoute = (app) => {
  supplierRoute.get("/", auth, authorize(ROLE_NAME.ADMIN), supplierController.getSuppliersController);
  supplierRoute.post("/", auth, authorize(ROLE_NAME.ADMIN), supplierController.createSupplierController);
  supplierRoute.put("/:supplierId", auth, authorize(ROLE_NAME.ADMIN), supplierController.updateSupplierController);
  supplierRoute.patch("/:supplierId/status", auth, authorize(ROLE_NAME.ADMIN), supplierController.updateSupplierStatusController);
  supplierRoute.delete("/:supplierId", auth, authorize(ROLE_NAME.ADMIN), supplierController.deleteSupplierController);

  app.use("/admin/suppliers", supplierRoute);
};

export default initSupplierRoute;
