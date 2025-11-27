import express from "express";
import bookingController from "../../controllers/customer/bookingController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const bookingRoute = express.Router();

const initBookingCustomerRoute = (app) => {
  bookingRoute.post(
    "/add",
    auth,
    authorize("USER"),
    bookingController.createBooking
  );
  bookingRoute.get(
    "/list",
    auth,
    authorize("USER"),
    bookingController.getBookings
  );
  bookingRoute.patch(
    "/cancel/:id",
    auth,
    authorize("USER"),
    bookingController.cancelBooking
  );
  app.use("/user/booking", bookingRoute);
};
export default initBookingCustomerRoute;
