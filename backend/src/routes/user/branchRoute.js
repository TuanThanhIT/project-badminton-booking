import express from "express";
import branchController from "../../controllers/user/branchController.js";
import validate from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import {
  getBranchesSchema,
  getBranchByIdSchema,
} from "../../validations/branchValidation.js";

const branchRoute = express.Router();

const initBranchRoute = (app) => {
  branchRoute.get(
    "/",
    auth,
    authorize("USER", "EMPLOYEE", "CUSTOMER"),
    validate(getBranchesSchema),
    branchController.getPagedBranchesController,
  );
  branchRoute.get(
    "/all",
    auth,
    authorize("USER", "EMPLOYEE", "CUSTOMER"),
    branchController.getAllBranchesController,
  );
  branchRoute.get(
    "/options",
    auth,
    authorize("USER", "EMPLOYEE", "CUSTOMER"),
    branchController.getBranchOptionsController,
  );
  branchRoute.get(
    "/:branchId",
    auth,
    authorize("USER", "EMPLOYEE", "CUSTOMER"),
    validate(getBranchByIdSchema),
    branchController.getBranchDetailController,
  );

  app.use("/user/branches", branchRoute);
};

export default initBranchRoute;
