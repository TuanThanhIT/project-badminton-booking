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
  // 1. Route "/all" ph?i n?m TR�N "/:branchId"
  branchRoute.get("/all", branchController.getAllBranchesSimpleController);

  // 2. Route l?y danh s�ch c� ph�n trang
  branchRoute.get(
    "/",
    validate(getBranchesSchema),
    branchController.getBranchesController,
  );

  // 3. Route l?y chi ti?t theo ID
  branchRoute.get(
    "/:branchId",
    validate(getBranchByIdSchema),
    branchController.getBranchByIdController,
  );
  branchRoute.get(
    "/",
    //auth,
    //authorize("USER", "COACH"),
    branchController.getAllBranchController,
  );
  app.use("/user/branches", branchRoute);
};

export default initBranchRoute;
