import express from "express";

import monthlyBookingController from "../../controllers/user/monthlyBookingController.js";

import {
  createMonthlyBookingSchema,
  calculateMonthlyBookingSchema,
} from "../../validations/monthlyBookingValidation.js";

import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const monthlyBookingRoute = express.Router();

const initMonthlyBookingRoute = (app) => {
  // 🔥 Tính tiền booking tháng
  monthlyBookingRoute.post(
    "/calculate",
    auth,
    authorize(ROLE_NAME.USER),
    validate(calculateMonthlyBookingSchema),
    monthlyBookingController.calculateMonthlyBookingController,
  );

  // 🔥 Tạo booking tháng
  monthlyBookingRoute.post(
    "/",
    auth,
    authorize(ROLE_NAME.USER),
    validate(createMonthlyBookingSchema),
    monthlyBookingController.createMonthlyBookingController,
  );

  app.use("/user/monthly-bookings", monthlyBookingRoute);
};

export default initMonthlyBookingRoute;
