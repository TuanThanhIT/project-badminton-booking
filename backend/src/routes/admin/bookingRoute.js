import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import bookingController from "../../controllers/admin/bookingController.js";
import validate from "../../middlewares/validate.js";
import { countBookingByBookingStatusSchema } from "../../validations/bookingValidation.js";

const bookingRoute = express.Router();

const initBookingAdminRoute = (app) => {
  bookingRoute.get(
    "/count",
    auth,
    authorize("ADMIN"),
    validate(countBookingByBookingStatusSchema),
    bookingController.countBookingByBookingStatus,
  );

  app.use("/admin/booking", bookingRoute);
};
export default initBookingAdminRoute;
