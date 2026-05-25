import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import employeeBookingController from "../../controllers/employee/bookingController.js";
import {
  bookingActionIdSchema,
  completeBookingActionSchema,
  getBookingsSchema,
  rejectBookingActionSchema,
} from "../../validations/bookingValidation.js";

const bookingRoute = express.Router();

const initEmployeeBookingRoute = (app) => {
  bookingRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(getBookingsSchema),
    employeeBookingController.getBookingsController,
  );

  bookingRoute.get(
    "/:bookingId",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(bookingActionIdSchema),
    employeeBookingController.getBookingDetailController,
  );

  bookingRoute.patch(
    "/:bookingId/confirm",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(bookingActionIdSchema),
    employeeBookingController.confirmBookingController,
  );

  bookingRoute.patch(
    "/:bookingId/complete",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(completeBookingActionSchema),
    employeeBookingController.completeBookingController,
  );

  bookingRoute.post(
    "/:bookingId/cancel/approve",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(bookingActionIdSchema),
    employeeBookingController.approveCancelBookingController,
  );

  bookingRoute.patch(
    "/:bookingId/cancel-request/approve",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(bookingActionIdSchema),
    employeeBookingController.approveCancelBookingController,
  );

  bookingRoute.post(
    "/:bookingId/cancel/reject",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(rejectBookingActionSchema),
    employeeBookingController.rejectCancelBookingController,
  );

  bookingRoute.patch(
    "/:bookingId/cancel-request/reject",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(rejectBookingActionSchema),
    employeeBookingController.rejectCancelBookingController,
  );

  bookingRoute.post(
    "/:bookingId/cancel-pending",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(rejectBookingActionSchema),
    employeeBookingController.cancelNoShowBookingController,
  );

  bookingRoute.patch(
    "/:bookingId/cancel-pending",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(rejectBookingActionSchema),
    employeeBookingController.cancelNoShowBookingController,
  );

  bookingRoute.post(
    "/:bookingId/no-show-cancel",
    auth,
    authorize(ROLE_NAME.EMPLOYEE),
    validate(rejectBookingActionSchema),
    employeeBookingController.cancelNoShowBookingController,
  );

  app.use("/employee/bookings", bookingRoute);
};

export default initEmployeeBookingRoute;
