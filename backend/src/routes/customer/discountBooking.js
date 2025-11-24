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
  discountBookingRoute.get(
    "/list",
    discountBookingController.getDiscountBooking
  );
  app.use("/user/discount/booking", discountBookingRoute);
};
export default initDiscountBookingCustomerRoute;
