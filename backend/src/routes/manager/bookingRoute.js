import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import bookingController from "../../controllers/manager/bookingController.js";
import {
  bookingActionIdSchema,
  getBookingsSchema,
} from "../../validations/bookingValidation.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const bookingRoute = express.Router();

const initBookingRoute = (app) => {
  bookingRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.MANAGER),
    validate(getBookingsSchema),
    bookingController.getBookings,
  );

  bookingRoute.get(
    "/:bookingId",
    auth,
    authorize(ROLE_NAME.MANAGER),
    validate(bookingActionIdSchema),
    bookingController.getBookingDetail,
  );

  app.use("/manager/bookings", bookingRoute);
};

export default initBookingRoute;
