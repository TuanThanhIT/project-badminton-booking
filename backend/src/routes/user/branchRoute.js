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
    authorize("USER"),
    validate(getBranchesSchema),
    branchController.getPagedBranchesController,
  );
  branchRoute.get(
    "/all",
    auth,
    authorize("USER"),
    branchController.getAllBranchesController,
  );
  branchRoute.get(
    "/options",
    auth,
    authorize("USER"),
    branchController.getBranchOptionsController,
  );
  branchRoute.get(
    "/:branchId",
    auth,
    authorize("USER"),
    validate(getBranchByIdSchema),
    branchController.getBranchDetailController,
  );

  app.use("/user/branches", branchRoute);
};

export default initBranchRoute;
