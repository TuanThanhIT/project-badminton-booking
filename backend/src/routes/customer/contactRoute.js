import express from "express";
import contactController from "../../controllers/customer/contactController.js";

const contactRoute = express.Router();

const initContactCustomerRoute = (app) => {
  contactRoute.post("/submit", contactController.submitContact);
  app.use("/user/contact", contactRoute);
};
export default initContactCustomerRoute;
