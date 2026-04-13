import express from "express";
import discountController from "../../controllers/user/discountController.js";
import validate from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import { applyDiscountBookingSchema } from "../../validations/discountValidation.js";

const discountRoute = express.Router();

const initDiscountRoute = (app) => {
  // Kiểm tra mã voucher khi khách nhập trên giao diện
  discountRoute.post(
    "/check-booking-discount",
    //auth,
    validate(applyDiscountBookingSchema),
    discountController.checkDiscountController,
  );

  app.use("/discounts", discountRoute);
};

export default initDiscountRoute;
