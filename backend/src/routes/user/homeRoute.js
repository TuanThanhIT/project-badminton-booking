import express from "express";
import homeController from "../../controllers/user/homeController.js";

const homeRoute = express.Router();

const initHomeRoute = (app) => {
  homeRoute.get("/", homeController.getHomeDataController);
  app.use("/user/home", homeRoute);
};

export default initHomeRoute;
