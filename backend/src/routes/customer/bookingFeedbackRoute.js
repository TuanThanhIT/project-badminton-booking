import express from "express";
import bookingFeedbackController from "../../controllers/customer/bookingFeedbackController.js";

const bookingFeedbackRoute = express.Router();

const initBookingFeedbackCustomerRoute = (app) => {
  bookingFeedbackRoute.post(
    "/feedback",
    bookingFeedbackController.createBookingFeedback
  );
  bookingFeedbackRoute.patch(
    "/feedback/:id",
    bookingFeedbackController.updateBookingFeedback
  );
  bookingFeedbackRoute.get(
    "/feedback/update/:id",
    bookingFeedbackController.getBookingFeedbackUpdate
  );
  bookingFeedbackRoute.get(
    "/feedback/:id",
    bookingFeedbackController.getBookingFeedback
  );
  app.use("/user/booking", bookingFeedbackRoute);
};
export default initBookingFeedbackCustomerRoute;
