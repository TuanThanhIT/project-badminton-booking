import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import courtController from "../../controllers/user/courtController.js";

const courtRoute = express.Router();

const initCourtRoute = (app) => {
  courtRoute.get("/", auth, authorize("User", "Coach"), courtController.getCourtsController);
  app.use("/user/courts", courtRoute);
};

export default initCourtRoute;
