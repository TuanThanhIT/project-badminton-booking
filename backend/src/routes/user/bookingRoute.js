import express from "express";
import bookingController from "../../controllers/user/bookingController.js";
import validate from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import {
  bookingCallbackSchema,
  cancelBookingSchema,
  createBookingSchema,
  getBookingsSchema,
  bookingActionIdSchema,
  walletBookingConfirmSchema,
} from "../../validations/bookingValidation.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const bookingRoute = express.Router();

const initBookingRoute = (app) => {
  bookingRoute.get(
    "/my-bookings",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(getBookingsSchema),
    bookingController.getMyBookingsController,
  );

  bookingRoute.get(
    "/:bookingId",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(bookingActionIdSchema),
    bookingController.getBookingByIdController,
  );

  bookingRoute.patch(
    "/vnpay/callback",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(bookingCallbackSchema),
    bookingController.bookingCallbackController,
  );

  bookingRoute.post(
    "/:bookingId/vnpay/retry",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(bookingActionIdSchema),
    bookingController.retryBookingVNPayController,
  );

  bookingRoute.patch(
    "/wallet/confirm",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(walletBookingConfirmSchema),
    bookingController.walletBookingConfirmController,
  );

  bookingRoute.patch(
    "/:bookingId/cancel",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(cancelBookingSchema),
    bookingController.cancelBookingController,
  );

  bookingRoute.patch(
    "/:bookingId/cancel-request",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(cancelBookingSchema),
    bookingController.requestCancelBookingController,
  );

  bookingRoute.post(
    "/",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(createBookingSchema),
    bookingController.createBookingController,
  );

  app.use("/user/bookings", bookingRoute);
};

export default initBookingRoute;
