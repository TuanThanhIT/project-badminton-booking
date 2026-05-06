import express from "express";
import courtController from "../../controllers/user/courtController.js";
import validate from "../../middlewares/validate.js";
import {
  getAvailableCourtsSchema,
  getCourtByIdSchema,
} from "../../validations/courtValidation.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const courtRoute = express.Router();

const initCourtRoute = (app) => {
  // API quan tr?ng nh?t: L?y s�n tr?ng theo gi? d? hi?n th? l�n giao di?n
  courtRoute.get(
    "/available",
    auth,
    authorize("USER", "COACH", "EMPLOYEE", "CUSTOMER"),
    validate(getAvailableCourtsSchema),
    courtController.getAvailableCourtsController,
  );

  courtRoute.get(
    "/:courtId",
    auth,
    authorize("USER", "COACH", "EMPLOYEE", "CUSTOMER"),
    validate(getCourtByIdSchema),
    courtController.getCourtByIdController,
  );
  courtRoute.get(
    "/",
    auth,
    authorize("USER", "COACH", "EMPLOYEE", "CUSTOMER"),
    courtController.getCourtsController,
  );
  app.use("/user/courts", courtRoute);
};

export default initCourtRoute;
