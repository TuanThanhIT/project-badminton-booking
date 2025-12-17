import express from "express";
import courtController from "../../controllers/admin/courtController.js";
import multer from "multer";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

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
    courtController.createCourt
  );
  courtRoute.post("/price/add", courtController.createCourtPrice);
  courtRoute.post(
    "/create-weekly-slots",
    auth,
    authorize("ADMIN"),
    courtController.createWeeklySlots
  );
  courtRoute.put(
    "/update/:courtId",
    auth,
    authorize("ADMIN"),
    courtController.updateCourt
  );
  courtRoute.get(
    "/",
    auth,
    authorize("ADMIN"),
    auth,
    authorize("ADMIN"),
    courtController.getAllCourts
  );
  courtRoute.get(
    "/:courtId",
    auth,
    authorize("ADMIN"),
    courtController.getCourtById
  );

  app.use("/admin/court", courtRoute);
};
export default initCourtAdminRoute;
