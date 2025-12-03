import express from "express";
import discountBookingController from "../../controllers/customer/discountBookingController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const discountBookingRoute = express.Router();

const initDiscountBookingCustomerRoute = (app) => {
  discountBookingRoute.post(
    "/add",
    auth,
    authorize("USER"),
    discountBookingController.applyDiscountBooking
  );
  discountBookingRoute.patch(
    "/update",
    auth,
    authorize("USER"),
    discountBookingController.updateDiscountBooking
  );
  discountBookingRoute.get(
    "/list",
    discountBookingController.getDiscountBooking
  );
  app.use("/user/discount/booking", discountBookingRoute);
};
export default initDiscountBookingCustomerRoute;
