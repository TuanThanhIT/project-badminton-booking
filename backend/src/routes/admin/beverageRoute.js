import express from "express";
import multer from "multer";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import beverageController from "../../controllers/admin/beverageController.js";
import validate from "../../middlewares/validate.js";
import {
  addBeverageSchema,
  getAllBeveragesSchema,
  getBeverageByIdSchema,
  updateBeverageSchema,
} from "../../validations/beverageValidation.js";

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
    validate(addBeverageSchema),
    beverageController.addBeverage,
  );
  beverageRoute.put(
    "/update/:beverageId",
    auth,
    authorize("ADMIN"),
    uploader.single("file"),
    validate(updateBeverageSchema),
    beverageController.updateBeverage,
  );

  beverageRoute.get(
    "/",
    auth,
    authorize("ADMIN"),
    validate(getAllBeveragesSchema),
    beverageController.getAllBeverages,
  );
  beverageRoute.get(
    "/:beverageId",
    auth,
    authorize("ADMIN"),
    validate(getBeverageByIdSchema),
    beverageController.getBeverageById,
  );

  app.use("/admin/beverage", beverageRoute);
};
export default initBeverageAdminRoute;
