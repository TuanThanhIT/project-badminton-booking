import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import bookingController from "../../controllers/employee/bookingController.js";

const bookingRoute = express.Router();

const initBookingEmployeeRoute = (app) => {
  bookingRoute.get(
    "/list",
    auth,
    authorize("EMPLOYEE"),
    bookingController.getBookings
  );
  bookingRoute.patch(
    "/confirm/:id",
    auth,
    authorize("EMPLOYEE"),
    bookingController.confirmedBooking
  );
  bookingRoute.patch(
    "/complete/:id",
    auth,
    authorize("EMPLOYEE"),
    bookingController.completedBooking
  );
  bookingRoute.patch(
    "/cancel/:id",
    auth,
    authorize("EMPLOYEE"),
    bookingController.cancelBooking
  );
  app.use("/employee/booking", bookingRoute);
};
export default initBookingEmployeeRoute;
