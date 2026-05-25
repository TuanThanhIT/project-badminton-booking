import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import {
  createCourtSchema,
  createCourtPriceSchema,
} from "../../validations/courtValidation.js";
import courtController from "../../controllers/manager/courtController.js";

const courtRoute = express.Router();

const initCourtRoute = (app) => {
  courtRoute.post(
    "/",
    auth,
    authorize("MANAGER"),
    validate(createCourtSchema),
    courtController.createCourtController,
  );
  courtRoute.post(
    "/prices",
    auth,
    authorize("MANAGER"),
    validate(createCourtPriceSchema),
    courtController.createCourtPriceController,
  );
  courtRoute.get(
    "/",
    auth,
    authorize("MANAGER"),
    courtController.getCourtsController,
  );
  courtRoute.get(
    "/prices",
    auth,
    authorize("MANAGER"),
    courtController.getCourtPricesController,
  );
  courtRoute.put(
    "/:courtId",
    auth,
    authorize("MANAGER"),
    courtController.updateCourtController,
  );

  courtRoute.patch(
    "/:courtId/maintenance",
    auth,
    authorize("MANAGER"),
    courtController.maintenanceCourtController,
  );

  courtRoute.patch(
    "/:courtId/close",
    auth,
    authorize("MANAGER"),
    courtController.closeCourtController,
  );
  app.use("/manager/courts", courtRoute);
};

export default initCourtRoute;
