import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import bookingController from "../../controllers/admin/bookingController.js";

const bookingRoute = express.Router();

const initBookingAdminRoute = (app) => {
  bookingRoute.get(
    "/count",
    auth,
    authorize("ADMIN"),
    bookingController.countBookingByBookingStatus
  );

  app.use("/admin/booking", bookingRoute);
};
export default initBookingAdminRoute;
