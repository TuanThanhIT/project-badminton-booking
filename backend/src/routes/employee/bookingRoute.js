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
  app.use("/employee/booking", bookingRoute);
};
export default initBookingEmployeeRoute;
