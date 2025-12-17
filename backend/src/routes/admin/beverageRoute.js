import express from "express";
import multer from "multer";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import beverageController from "../../controllers/admin/beverageController.js";

const beverageRoute = express.Router();

var uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const initBeverageAdminRoute = (app) => {
  beverageRoute.post(
    "/add",
    auth,
    authorize("ADMIN"),
    uploader.single("file"),
    beverageController.addBeverage
  );
  beverageRoute.put(
    "/update/:beverageId",
    auth,
    authorize("ADMIN"),
    uploader.single("file"),
    beverageController.updateBeverage
  );

  beverageRoute.get(
    "/",
    auth,
    authorize("ADMIN"),
    beverageController.getAllBeverages
  );
  beverageRoute.get(
    "/:beverageId",
    auth,
    authorize("ADMIN"),
    beverageController.getBeverageById
  );

  app.use("/admin/beverage", beverageRoute);
};
export default initBeverageAdminRoute;
