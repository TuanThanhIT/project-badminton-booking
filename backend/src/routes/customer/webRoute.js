import express from "express";
import { helloWorld } from "../../controllers/customer/helloWorldController.js";
import auth from "../../middlewares/auth.js";
const router = express.Router();

const initWebRoutes = (app) => {
  router.get("/abc", helloWorld);
  return app.use("/customer", auth, router);
};
export default initWebRoutes;
