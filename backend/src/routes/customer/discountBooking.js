import express from "express";
import discountBookingController from "../../controllers/customer/discountBookingController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  applyDiscountBookingSchema,
  updateDiscountBookingSchema,
} from "../../validations/discountValidation.js";

const discountBookingRoute = express.Router();

const initDiscountBookingCustomerRoute = (app) => {
  discountBookingRoute.post(
    "/add",
    auth,
    authorize("USER"),
    validate(applyDiscountBookingSchema),
    discountBookingController.applyDiscountBooking,
  );
  discountBookingRoute.patch(
    "/update",
    auth,
    authorize("USER"),
    validate(updateDiscountBookingSchema),
    discountBookingController.updateDiscountBooking,
  );
  discountBookingRoute.get(
    "/list",
    discountBookingController.getDiscountBooking,
  );
  app.use("/user/discount/booking", discountBookingRoute);
};
export default initDiscountBookingCustomerRoute;
