import express from "express";
import discountBookingController from "../../controllers/admin/discountBookingController.js";

const discountBookingRoute = express.Router();

const initDiscountBookingAdminRoute = (app) => {
  discountBookingRoute.post(
    "/add",
    discountBookingController.createDiscountBooking
  );
  app.use("/admin/discount/booking", discountBookingRoute);
};
export default initDiscountBookingAdminRoute;
