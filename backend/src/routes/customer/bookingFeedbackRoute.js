import express from "express";
import bookingFeedbackController from "../../controllers/customer/bookingFeedbackController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  createBookingFeedbackSchema,
  getBookingFeedbackSchema,
  getBookingFeedbackUpdateSchema,
  updateBookingFeedbackSchema,
} from "../../validations/bookingFeedbackValidation.js";

const bookingFeedbackRoute = express.Router();

const initBookingFeedbackCustomerRoute = (app) => {
  bookingFeedbackRoute.post(
    "/feedback",
    auth,
    authorize("USER"),
    validate(createBookingFeedbackSchema),
    bookingFeedbackController.createBookingFeedback,
  );
  bookingFeedbackRoute.patch(
    "/feedback/:bookingId",
    auth,
    authorize("USER"),
    validate(updateBookingFeedbackSchema),
    bookingFeedbackController.updateBookingFeedback,
  );
  bookingFeedbackRoute.get(
    "/feedback/update/:bookingId",
    auth,
    authorize("USER"),
    validate(getBookingFeedbackUpdateSchema),
    bookingFeedbackController.getBookingFeedbackUpdate,
  );
  bookingFeedbackRoute.get(
    "/feedback/:courtId",
    auth,
    authorize("USER"),
    validate(getBookingFeedbackSchema),
    bookingFeedbackController.getBookingFeedback,
  );
  app.use("/user/booking", bookingFeedbackRoute);
};
export default initBookingFeedbackCustomerRoute;
