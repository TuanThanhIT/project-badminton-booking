import express from "express";
import discountBookingController from "../../controllers/admin/discountBookingController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const discountBookingRoute = express.Router();

const initDiscountBookingAdminRoute = (app) => {
  discountBookingRoute.post(
    "/add",
    auth,
    authorize("ADMIN"),
    discountBookingController.createDiscountBooking
  );
  discountBookingRoute.delete(
    "/delete/:id",
    auth,
    authorize("ADMIN"),
    discountBookingController.deleteDiscountBooking
  );
  discountBookingRoute.patch(
    "/update/:id",
    auth,
    authorize("ADMIN"),
    discountBookingController.updateDiscountBooking
  );
  discountBookingRoute.get(
    "/list",
    auth,
    authorize("ADMIN"),
    discountBookingController.getDiscountBookings
  );
  app.use("/admin/discount/booking", discountBookingRoute);
};
export default initDiscountBookingAdminRoute;
