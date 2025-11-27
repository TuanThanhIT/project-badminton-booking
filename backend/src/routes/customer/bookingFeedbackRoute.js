import express from "express";
import bookingFeedbackController from "../../controllers/customer/bookingFeedbackController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const bookingFeedbackRoute = express.Router();

const initBookingFeedbackCustomerRoute = (app) => {
  bookingFeedbackRoute.post(
    "/feedback",
    auth,
    authorize("USER"),
    bookingFeedbackController.createBookingFeedback
  );
  bookingFeedbackRoute.patch(
    "/feedback/:id",
    auth,
    authorize("USER"),
    bookingFeedbackController.updateBookingFeedback
  );
  bookingFeedbackRoute.get(
    "/feedback/update/:id",
    auth,
    authorize("USER"),
    bookingFeedbackController.getBookingFeedbackUpdate
  );
  bookingFeedbackRoute.get(
    "/feedback/:id",
    auth,
    authorize("USER"),
    bookingFeedbackController.getBookingFeedback
  );
  app.use("/user/booking", bookingFeedbackRoute);
};
export default initBookingFeedbackCustomerRoute;
