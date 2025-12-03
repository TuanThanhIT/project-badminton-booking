import express from "express";
import discountBookingController from "../../controllers/admin/discountBookingController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const discountBookingRoute = express.Router();

const initDiscountBookingAdminRoute = (app) => {
  discountBookingRoute.post(
    "/add",
    auth,
    authorize(),
    discountBookingController.createDiscountBooking
  );
  app.use("/admin/discount/booking", discountBookingRoute);
};
export default initDiscountBookingAdminRoute;
