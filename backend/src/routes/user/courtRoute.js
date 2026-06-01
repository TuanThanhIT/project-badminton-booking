import express from "express";
import courtController from "../../controllers/user/courtController.js";
import validate from "../../middlewares/validate.js";
import {
  getAvailableCourtsSchema,
  getCourtByIdSchema,
} from "../../validations/courtValidation.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import { ROLE_NAME } from "../../constants/userConstant.js";

const courtRoute = express.Router();

const initCourtRoute = (app) => {
  courtRoute.get(
    "/available",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(getAvailableCourtsSchema),
    courtController.getAvailableCourtsController,
  );

  courtRoute.get(
    "/:courtId",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    validate(getCourtByIdSchema),
    courtController.getCourtByIdController,
  );
  courtRoute.get(
    "/",
    auth,
    authorize(ROLE_NAME.USER, ROLE_NAME.COACH),
    courtController.getCourtsController,
  );
  app.use("/user/courts", courtRoute);
};

export default initCourtRoute;
