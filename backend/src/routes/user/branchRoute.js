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
    validate(getBranchesSchema),
    branchController.getBranchesController,
  );
  branchRoute.get(
    "/:branchId",
    validate(getBranchByIdSchema),
    branchController.getBranchByIdController,
  );
  app.use("/branches", branchRoute);
};

export default initBranchRoute;
