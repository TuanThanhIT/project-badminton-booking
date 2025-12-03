import express from "express";
import courtController from "../../controllers/customer/courtController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const courtRoute = express.Router();

const initCourtCustomerRoute = (app) => {
  courtRoute.get("/list", auth, authorize("USER"), courtController.getCourts);
  courtRoute.get(
    "/schedule/:id",
    auth,
    authorize("USER"),
    courtController.getCourtSchedule
  );
  courtRoute.get(
    "/price",
    auth,
    authorize("USER"),
    courtController.getCourtPrice
  );
  app.use("/user/court", courtRoute);
};
export default initCourtCustomerRoute;
