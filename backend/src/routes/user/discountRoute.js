import express from "express";
import discountController from "../../controllers/user/discountController.js";
import validate from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import {
  applyDiscountBookingSchema,
  applyDiscountSchema,
  getDiscountsCheckoutSchema,
} from "../../validations/discountValidation.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const discountRoute = express.Router();

const initDiscountRoute = (app) => {
  // Kiểm tra mã voucher khi khách nhập trên giao diện
  discountRoute.post(
    "/check-booking-discount",
    //auth,
    validate(applyDiscountBookingSchema),
    discountController.checkDiscountController,
  );
  discountRoute.post(
    "/apply",
    auth,
    authorize(ROLE_NAME.USER),
    validate(applyDiscountSchema),
    discountController.applyDiscountController,
  );
  discountRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.USER),
    validate(getDiscountsCheckoutSchema),
    discountController.getDiscountsCheckoutController,
  );
  app.use("/user/discounts", discountRoute);
};

export default initDiscountRoute;
