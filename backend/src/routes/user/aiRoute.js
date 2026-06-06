import express from "express";
import aiController from "../../controllers/user/aiController.js";
import optionalAuth from "../../middlewares/optionalAuth.js";
import validate from "../../middlewares/validate.js";
import {
  chatSchema,
  chatStreamSchema,
  listSessionsQuerySchema,
  sessionIdParamSchema,
} from "../../validations/aiValidation.js";

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

  app.use("/user/ai", aiRoute);
};

export default initAiRoute;
