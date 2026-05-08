import express from "express";
import branchController from "../../controllers/user/branchController.js";
import validate from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import {
  getBranchesSchema,
  getBranchByIdSchema,
} from "../../validations/branchValidation.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const branchRoute = express.Router();

const initBranchRoute = (app) => {
  branchRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.USER),
    validate(getBranchesSchema),
    branchController.getPagedBranchesController,
  );
  branchRoute.get(
    "/all",
    auth,
    authorize(ROLE_NAME.USER),
    branchController.getAllBranchesController,
  );
  branchRoute.get(
    "/options",
    auth,
    authorize(ROLE_NAME.USER),
    branchController.getBranchOptionsController,
  );
  branchRoute.get(
    "/:branchId",
    auth,
    authorize(ROLE_NAME.USER),
    validate(getBranchByIdSchema),
    branchController.getBranchDetailController,
  );

  app.use("/user/branches", branchRoute);
};

export default initBranchRoute;
