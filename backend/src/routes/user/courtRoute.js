import express from "express";
import courtController from "../../controllers/user/courtController.js";
import validate from "../../middlewares/validate.js";
import {
  getAvailableCourtsSchema,
  getCourtByIdSchema,
} from "../../validations/courtValidation.js";

const courtRoute = express.Router();

const initCourtRoute = (app) => {
  // API quan trọng nhất: Lấy sân trống theo giờ để hiển thị lên giao diện
  courtRoute.get(
    "/available",
    validate(getAvailableCourtsSchema),
    courtController.getAvailableCourtsController,
  );

  courtRoute.get(
    "/:courtId",
    validate(getCourtByIdSchema),
    courtController.getCourtByIdController,
  );

  app.use("/courts", courtRoute);
};

export default initCourtRoute;
