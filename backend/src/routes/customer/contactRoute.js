import express from "express";
import contactController from "../../controllers/customer/contactController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const contactRoute = express.Router();

const initContactCustomerRoute = (app) => {
  contactRoute.post(
    "/submit",
    auth,
    authorize("USER"),
    contactController.submitContact
  );
  app.use("/user/contact", contactRoute);
};
export default initContactCustomerRoute;
