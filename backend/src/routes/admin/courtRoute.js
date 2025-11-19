import express from "express";
import courtController from "../../controllers/admin/courtController.js";
import multer from "multer";

const courtRoute = express.Router();

var uploader = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const initCourtAdminRoute = (app) => {
  courtRoute.post("/add", uploader.single("file"), courtController.createCourt);
  courtRoute.post("/price/add", courtController.createCourtPrice);
  courtRoute.post("/create-weekly-slots", courtController.createWeeklySlots);
  app.use("/admin/court", courtRoute);
};
export default initCourtAdminRoute;
