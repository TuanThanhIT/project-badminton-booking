import express from "express";
import multer from "multer";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import beverageController from "../../controllers/admin/beverageController.js";

const beverageRoute = express.Router();

var uploader = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const initBeverageAdminRoute = (app) => {
  beverageRoute.post(
    "/add",
    // auth,
    // authorize(),
    uploader.single("file"),
    beverageController.addBeverage
  );
  beverageRoute.put(
    "/update/:beverageId",
    uploader.single("file"),
    beverageController.updateBeverage
  );

  beverageRoute.get("/", beverageController.getAllBeverages);
  beverageRoute.get("/:beverageId", beverageController.getBeverageById);

  app.use("/admin/beverage", beverageRoute);
};
export default initBeverageAdminRoute;
