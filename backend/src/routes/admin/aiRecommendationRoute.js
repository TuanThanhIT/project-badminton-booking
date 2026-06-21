import express from "express";
import auth from "../../middlewares/auth.js";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import { ROLE_NAME } from "../../constants/userConstant.js";
import aiRecommendationController from "../../controllers/admin/aiRecommendationController.js";
import { adminInsightsQuerySchema } from "../../validations/aiRecommendationValidation.js";

const adminAiRecommendationRoute = express.Router();

const initAdminAiRecommendationRoute = (app) => {
  adminAiRecommendationRoute.get(
    "/insights",
    auth,
    authorize(ROLE_NAME.ADMIN),
    validate(adminInsightsQuerySchema),
    aiRecommendationController.getAdminInsightsController,
  );

  adminAiRecommendationRoute.post(
    "/train",
    auth,
    authorize(ROLE_NAME.ADMIN),
    aiRecommendationController.trainModelController,
  );

  adminAiRecommendationRoute.get(
    "/status",
    auth,
    authorize(ROLE_NAME.ADMIN),
    aiRecommendationController.getAiServiceStatusController,
  );

  app.use("/admin/ai", adminAiRecommendationRoute);
};

export default initAdminAiRecommendationRoute;
