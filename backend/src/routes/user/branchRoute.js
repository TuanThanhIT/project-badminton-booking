import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import branchController from "../../controllers/user/branchController.js";

const branchRoute = express.Router();

const initBranchRoute = (app) => {
  branchRoute.get(
    "/",
    auth,
    authorize("User"),
    branchController.getAllBranchController,
  );

  app.use("/user/branches", branchRoute);
};

export default initBranchRoute;
