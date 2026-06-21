import express from "express";
import aiController from "../../controllers/user/aiController.js";
import aiRecommendationController from "../../controllers/user/aiRecommendationController.js";
import productRecommendationController from "../../controllers/user/productRecommendationController.js";
import optionalAuth from "../../middlewares/optionalAuth.js";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import {
  chatSchema,
  chatStreamSchema,
  listSessionsQuerySchema,
  sessionIdParamSchema,
} from "../../validations/aiValidation.js";
import {
  userRecommendationQuerySchema,
  productRecommendationQuerySchema,
  relatedProductQuerySchema,
} from "../../validations/aiRecommendationValidation.js";

const aiRoute = express.Router();

const initAiRoute = (app) => {
  aiRoute.post(
    "/chat",
    optionalAuth,
    validate(chatSchema),
    aiController.chatController,
  );

  aiRoute.post(
    "/chat/stream",
    optionalAuth,
    validate(chatStreamSchema),
    aiController.chatStreamController,
  );

  aiRoute.get(
    "/sessions",
    optionalAuth,
    validate(listSessionsQuerySchema),
    aiController.listSessionsController,
  );

  aiRoute.get(
    "/sessions/:sessionId/messages",
    optionalAuth,
    validate(sessionIdParamSchema),
    aiController.getSessionMessagesController,
  );

  aiRoute.delete(
    "/sessions/:sessionId/messages",
    optionalAuth,
    validate(sessionIdParamSchema),
    aiController.clearSessionController,
  );

  aiRoute.delete(
    "/sessions/:sessionId",
    optionalAuth,
    validate(sessionIdParamSchema),
    aiController.deleteSessionController,
  );

  aiRoute.get(
    "/recommendations",
    auth,
    validate(userRecommendationQuerySchema),
    aiRecommendationController.getUserRecommendationsController,
  );

  aiRoute.get(
    "/recommendations/public",
    optionalAuth,
    validate(userRecommendationQuerySchema),
    aiRecommendationController.getPublicRecommendationsController,
  );

  aiRoute.get(
    "/product-recommendations",
    optionalAuth,
    validate(productRecommendationQuerySchema),
    productRecommendationController.getProductRecommendationsController,
  );

  aiRoute.get(
    "/product-recommendations/related",
    optionalAuth,
    validate(relatedProductQuerySchema),
    productRecommendationController.getRelatedProductsController,
  );

  app.use("/user/ai", aiRoute);
};

export default initAiRoute;
