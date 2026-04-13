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
  // 🔥 1. Simple list (dropdown)
  branchRoute.get("/simple", branchController.getAllBranchesSimpleController);

  // 🔥 2. Full list (không phân trang)
  branchRoute.get("/all", branchController.getAllBranchController);

  // 🔥 3. List có phân trang + filter
  branchRoute.get(
    "/",
    validate(getBranchesSchema),
    branchController.getBranchesController,
  );

  // 🔥 4. Detail theo ID (luôn để cuối)
  branchRoute.get(
    "/:branchId",
    validate(getBranchByIdSchema),
    branchController.getBranchByIdController,
  );

  app.use("/user/branches", branchRoute);
};

export default initBranchRoute;
