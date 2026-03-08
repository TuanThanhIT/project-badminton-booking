import express from "express";
import courtController from "../../controllers/admin/courtController.js";
import multer from "multer";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import {
  createCourtPriceSchema,
  createCourtSchema,
  createWeeklySlotsSchema,
  getCourtByIdSchema,
  updateCourtSchema,
} from "../../validations/courtValidation.js";

const courtRoute = express.Router();

var uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const initCourtAdminRoute = (app) => {
  courtRoute.post(
    "/add",
    auth,
    authorize("ADMIN"),
    uploader.single("file"),
    validate(createCourtSchema),
    courtController.createCourt,
  );
  courtRoute.post(
    "/price/add",
    validate(createCourtPriceSchema),
    courtController.createCourtPrice,
  );
  courtRoute.post(
    "/create-weekly-slots",
    auth,
    authorize("ADMIN"),
    validate(createWeeklySlotsSchema),
    courtController.createWeeklySlots,
  );
  courtRoute.put(
    "/update/:courtId",
    auth,
    authorize("ADMIN"),
    validate(updateCourtSchema),
    courtController.updateCourt,
  );
  courtRoute.get(
    "/",
    auth,
    authorize("ADMIN"),
    auth,
    authorize("ADMIN"),
    courtController.getAllCourts,
  );
  courtRoute.get(
    "/:courtId",
    auth,
    authorize("ADMIN"),
    validate(getCourtByIdSchema),
    courtController.getCourtById,
  );

  app.use("/admin/court", courtRoute);
};
export default initCourtAdminRoute;
