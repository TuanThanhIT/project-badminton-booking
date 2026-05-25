import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import adminDiscountController from "../../controllers/admin/discountController.js";

const adminDiscountRoute = express.Router();

const initAdminDiscountRoute = (app) => {
  adminDiscountRoute.get("/", auth, authorize(ROLE_NAME.ADMIN), adminDiscountController.getDiscountsController);
  adminDiscountRoute.post("/", auth, authorize(ROLE_NAME.ADMIN), adminDiscountController.createDiscountController);
  adminDiscountRoute.put("/:discountId/toggle", auth, authorize(ROLE_NAME.ADMIN), adminDiscountController.toggleDiscountController);
  adminDiscountRoute.put("/:discountId", auth, authorize(ROLE_NAME.ADMIN), adminDiscountController.updateDiscountController);
  adminDiscountRoute.delete("/:discountId", auth, authorize(ROLE_NAME.ADMIN), adminDiscountController.deleteDiscountController);

  app.use("/admin/discounts", adminDiscountRoute);
};

export default initAdminDiscountRoute;
