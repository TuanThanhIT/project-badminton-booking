import express from "express";
import bookingController from "../../controllers/customer/bookingController.js";

const bookingRoute = express.Router();

const initBookingCustomerRoute = (app) => {
  bookingRoute.post("/add", bookingController.createBooking);
  bookingRoute.get("/list", bookingController.getBookings);
  bookingRoute.patch("/cancel/:id", bookingController.cancelBooking);
  app.use("/user/booking", bookingRoute);
};
export default initBookingCustomerRoute;
