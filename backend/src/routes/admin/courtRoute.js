import express from "express";
import courtController from "../../controllers/admin/courtController.js";
import multer from "multer";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const courtRoute = express.Router();

var uploader = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const initCourtAdminRoute = (app) => {
  courtRoute.post(
    "/add",
    // auth,
    // authorize(),
    uploader.single("file"),
    courtController.createCourt
  );
  courtRoute.post("/price/add", auth, courtController.createCourtPrice);
  courtRoute.post(
    "/create-weekly-slots",
    // auth,
    // authorize(),
    courtController.createWeeklySlots
  );
  courtRoute.put("/update/:courtId", courtController.updateCourt);
  courtRoute.get("/", courtController.getAllCourts);
  courtRoute.get("/:courtId", courtController.getCourtById);
  app.use("/admin/court", courtRoute);
};
export default initCourtAdminRoute;
