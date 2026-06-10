import express from "express";
import locationController from "../../controllers/user/locationController.js";

const locationRoute = express.Router();

const initLocationRoute = (app) => {
  locationRoute.get("/provinces", locationController.getProvincesController);
  locationRoute.get("/districts", locationController.getDistrictsController);
  locationRoute.get("/wards", locationController.getWardsController);

  app.use("/user/locations", locationRoute);
};

export default initLocationRoute;
