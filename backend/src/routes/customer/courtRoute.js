import express from "express";
import courtController from "../../controllers/customer/courtController.js";

const courtRoute = express.Router();

const initCourtCustomerRoute = (app) => {
  courtRoute.get("/list", courtController.getCourts);
  courtRoute.get("/schedule/:id", courtController.getCourtSchedule);
  courtRoute.get("/price", courtController.getCourtPrice);
  app.use("/user/court", courtRoute);
};
export default initCourtCustomerRoute;
