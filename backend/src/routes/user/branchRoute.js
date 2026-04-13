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
  // 1. Route "/all" phải nằm TRÊN "/:branchId"
  branchRoute.get("/all", branchController.getAllBranchesSimpleController);

  // 2. Route lấy danh sách có phân trang
  branchRoute.get(
    "/",
    validate(getBranchesSchema),
    branchController.getBranchesController,
  );

  // 3. Route lấy chi tiết theo ID
  branchRoute.get(
    "/:branchId",
    validate(getBranchByIdSchema),
    branchController.getBranchByIdController,
  );

  app.use("/branches", branchRoute);
};

export default initBranchRoute;
