import express from "express";
import discountBookingController from "../../controllers/admin/discountBookingController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  createDiscountBookingSchema,
  deleteDiscountBookingSchema,
  getDiscountBookingsSchema,
  updateDiscountBookingSchema,
} from "../../validations/discountValidation.js";

const discountBookingRoute = express.Router();

const initDiscountBookingAdminRoute = (app) => {
  discountBookingRoute.post(
    "/add",
    auth,
    authorize("ADMIN"),
    validate(createDiscountBookingSchema),
    discountBookingController.createDiscountBooking,
  );
  discountBookingRoute.delete(
    "/delete/:discountId",
    auth,
    authorize("ADMIN"),
    validate(deleteDiscountBookingSchema),
    discountBookingController.deleteDiscountBooking,
  );
  discountBookingRoute.patch(
    "/update/:discountId",
    auth,
    authorize("ADMIN"),
    validate(updateDiscountBookingSchema),
    discountBookingController.updateDiscountBooking,
  );
  discountBookingRoute.get(
    "/list",
    auth,
    authorize("ADMIN"),
    validate(getDiscountBookingsSchema),
    discountBookingController.getDiscountBookings,
  );
  app.use("/admin/discount/booking", discountBookingRoute);
};
export default initDiscountBookingAdminRoute;
