import express from "express";
import bookingController from "../../controllers/user/bookingController.js";
import validate from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";
import {
  createBookingSchema,
  getBookingsSchema,
} from "../../validations/bookingValidation.js";

const bookingRoute = express.Router();

const initBookingRoute = (app) => {
  // Lấy lịch sử đặt sân của user (cần đăng nhập)
  bookingRoute.get(
    "/my-bookings",
    //auth,
    validate(getBookingsSchema),
    bookingController.getMyBookingsController,
  );

  // Tạo đơn đặt sân mới
  bookingRoute.post(
    "/",
    //auth, // Phải đăng nhập mới được đặt
    validate(createBookingSchema),
    bookingController.createBookingController,
  );

  app.use("/bookings", bookingRoute);
};

export default initBookingRoute;
