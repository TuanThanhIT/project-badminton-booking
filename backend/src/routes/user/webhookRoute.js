import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import ghnWebhookController from "../../controllers/user/ghnWebhookController.js";

const webhookRoute = express.Router();

const initWebhookRoute = (app) => {
  webhookRoute.post("/ghn", ghnWebhookController.ghnWebhookHandlerController);
  app.use("/user/webhook", webhookRoute);
};

export default initWebhookRoute;
