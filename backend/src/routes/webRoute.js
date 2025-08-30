import express from "express";
import { helloWorld } from "../controllers/helloWorldController.js";
const router = express.Router();

const initWebRoutes = (app) => {
  router.get("/", helloWorld);
  return app.use("/", router);
};
export default initWebRoutes;
