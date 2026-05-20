import express from "express";
import bookingController from "../../controllers/user/bookingController.js";
import validate from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import {
  bookingCallbackSchema,
  cancelBookingSchema,
  createBookingSchema,
  getBookingsSchema,
} from "../../validations/bookingValidation.js";

const bookingRoute = express.Router();

const initBookingRoute = (app) => {
  bookingRoute.get(
    "/my-bookings",
    auth,
    validate(getBookingsSchema),
    bookingController.getMyBookingsController,
  );

  bookingRoute.patch(
    "/vnpay/callback",
    auth,
    validate(bookingCallbackSchema),
    bookingController.bookingCallbackController,
  );

  bookingRoute.patch(
    "/:bookingId/cancel",
    auth,
    validate(cancelBookingSchema),
    bookingController.cancelBookingController,
  );

  bookingRoute.patch(
    "/:bookingId/cancel-request",
    auth,
    validate(cancelBookingSchema),
    bookingController.requestCancelBookingController,
  );

  bookingRoute.post(
    "/",
    auth,
    validate(createBookingSchema),
    bookingController.createBookingController,
  );

  app.use("/bookings", bookingRoute);
};

export default initBookingRoute;
