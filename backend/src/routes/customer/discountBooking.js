import express from "express";
import discountBookingController from "../../controllers/customer/discountBookingController.js";

const discountBookingRoute = express.Router();

const initDiscountBookingCustomerRoute = (app) => {
  discountBookingRoute.post(
    "/add",
    discountBookingController.applyDiscountBooking
  );
  discountBookingRoute.patch(
    "/update",
    discountBookingController.updateDiscountBooking
  );
  app.use("/user/discount/booking", discountBookingRoute);
};
export default initDiscountBookingCustomerRoute;
