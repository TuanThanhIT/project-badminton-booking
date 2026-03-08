import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import beverageController from "../../controllers/employee/beverageController.js";
import validate from "../../middlewares/validate.js";
import { getBeveragesSchema } from "../../validations/beverageValidation.js";

const beverageRoute = express.Router();

const initBeverageEmployeeRoute = (app) => {
  beverageRoute.get(
    "/list",
    auth,
    authorize("EMPLOYEE"),
    validate(getBeveragesSchema),
    beverageController.getBeverages,
  );
  app.use("/employee/beverage", beverageRoute);
};
export default initBeverageEmployeeRoute;
