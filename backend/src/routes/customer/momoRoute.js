import express from "express";
import momoController from "../../controllers/customer/momoController.js";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";

const momoRoute = express.Router();

const initMomoCustomerRoute = (app) => {
  // Frontend gọi để tạo payment
  momoRoute.post(
    "/create-momo-payment",
    auth,
    authorize("USER"),
    momoController.createMoMoPayment
  );
  // MoMo gọi webhook
  momoRoute.post(
    "/momo-webhook",
    express.json(),
    momoController.handleMoMoWebhook
  );
  app.use("/user/momo", momoRoute);
};
export default initMomoCustomerRoute;
