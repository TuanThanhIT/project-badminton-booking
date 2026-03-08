import express from "express";
import contactController from "../../controllers/customer/contactController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import { submitContactSchema } from "../../validations/contactValidation.js";

const contactRoute = express.Router();

const initContactCustomerRoute = (app) => {
  contactRoute.post(
    "/submit",
    auth,
    authorize("USER"),
    validate(submitContactSchema),
    contactController.submitContact,
  );
  app.use("/user/contact", contactRoute);
};
export default initContactCustomerRoute;
