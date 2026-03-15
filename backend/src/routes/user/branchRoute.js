import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import branchController from "../../controllers/user/branchController.js";
import validate from "../../middlewares/validate.js";
import { getAllBranchSchema } from "../../validations/branchValidation.js";

const branchRoute = express.Router();

const initBranchRoute = (app) => {
  branchRoute.get(
    "/",
    auth,
    authorize("User"),
    validate(getAllBranchSchema),
    branchController.getAllBranchController,
  );

  app.use("/user/branches", branchRoute);
};

export default initBranchRoute;
