import express from "express";

import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

import branchController from "../../controllers/manager/branchController.js";

const branchRoute = express.Router();

const initBranchRoute = (app) => {
  branchRoute.get(
    "/my-branch",
    auth,
    authorize("MANAGER"),
    branchController.getMyBranchController,
  );

  app.use("/manager/branches", branchRoute);
};

export default initBranchRoute;
