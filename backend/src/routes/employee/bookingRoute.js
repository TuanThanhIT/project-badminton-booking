import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import bookingController from "../../controllers/employee/bookingController.js";
import validate from "../../middlewares/validate.js";
import {
  cancelBookingSchema,
  completedBookingSchema,
  confirmedBookingSchema,
  getBookingsSchema,
} from "../../validations/bookingValidation.js";

const bookingRoute = express.Router();

const initBookingEmployeeRoute = (app) => {
  bookingRoute.get(
    "/list",
    auth,
    authorize("EMPLOYEE"),
    validate(getBookingsSchema),
    bookingController.getBookings,
  );
  bookingRoute.patch(
    "/confirm/:bookingId",
    auth,
    authorize("EMPLOYEE"),
    validate(confirmedBookingSchema),
    bookingController.confirmedBooking,
  );
  bookingRoute.patch(
    "/complete/:bookingId",
    auth,
    authorize("EMPLOYEE"),
    validate(completedBookingSchema),
    bookingController.completedBooking,
  );
  bookingRoute.patch(
    "/cancel/:bookingId",
    auth,
    authorize("EMPLOYEE"),
    validate(cancelBookingSchema),
    bookingController.cancelBooking,
  );
  app.use("/employee/booking", bookingRoute);
};
export default initBookingEmployeeRoute;
