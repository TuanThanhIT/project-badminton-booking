import express from "express";
import bookingController from "../../controllers/customer/bookingController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  cancelBookingSchema,
  createBookingSchema,
} from "../../validations/bookingValidation.js";

const bookingRoute = express.Router();

const initBookingCustomerRoute = (app) => {
  bookingRoute.post(
    "/add",
    auth,
    authorize("USER"),
    validate(createBookingSchema),
    bookingController.createBooking,
  );
  bookingRoute.get(
    "/list",
    auth,
    authorize("USER"),
    bookingController.getBookings,
  );
  bookingRoute.patch(
    "/cancel/:bookingId",
    auth,
    authorize("USER"),
    validate(cancelBookingSchema),
    bookingController.cancelBooking,
  );
  app.use("/user/booking", bookingRoute);
};
export default initBookingCustomerRoute;
