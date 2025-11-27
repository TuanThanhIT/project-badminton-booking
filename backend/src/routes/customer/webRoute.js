import express from "express";
import { helloWorld } from "../../controllers/customer/helloWorldController.js";
const router = express.Router();

const initWebRoutes = (app) => {
  router.get("/abc", helloWorld);
  return app.use("/user", router);
};
export default initWebRoutes;
