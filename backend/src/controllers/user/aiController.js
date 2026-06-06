import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import aiService from "../../services/user/aiService.js";
import { AiChatSession } from "../../models/index.js";
import aiChatHistoryService from "../../services/user/aiChatHistoryService.js";

const buildChatPayload = (req) => ({
  message: req.body.message,
  context: req.body.context,
  sessionId: req.body.sessionId,
  guestToken: req.body.guestToken,
  userId: req.user?.id ?? null,
  branchId: req.body.branchId,
  courtId: req.body.courtId,
  productId: req.body.productId,
  history: req.body.history,
});

const buildAccess = (req) => ({
  userId: req.user?.id ?? null,
  guestToken: req.query.guestToken || req.body?.guestToken || null,
});

const chatController = asyncHandler(async (req, res) => {
  const result = await aiService.chatService(buildChatPayload(req));
  return res.status(200).json(
    new SuccessResponse("Phản hồi AI thành công", {
      answer: result.answer,
      sessionId: result.sessionId,
      guestToken: result.guestToken,
    }),
  );
});

const chatStreamController = asyncHandler(async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  await aiService.streamChatService(buildChatPayload(req), sendEvent);
  res.end();
});

const getSessionMessagesController = asyncHandler(async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  const access = buildAccess(req);
  const session = await AiChatSession.findByPk(sessionId);
  aiChatHistoryService.assertSessionAccess(session, access);

  const rows = await aiChatHistoryService.loadSessionMessages(sessionId);
  return res.status(200).json(
    new SuccessResponse("Lấy lịch sử chat thành công", {
      sessionId,
      messages: rows.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    }),
  );
});

const clearSessionController = asyncHandler(async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  await aiChatHistoryService.clearSessionMessages(sessionId, buildAccess(req));
  return res
    .status(200)
    .json(new SuccessResponse("Đã xóa lịch sử phiên chat", { sessionId }));
});

const deleteSessionController = asyncHandler(async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  await aiChatHistoryService.deleteSession(sessionId, buildAccess(req));
  return res
    .status(200)
    .json(new SuccessResponse("Đã xóa phiên chat", { sessionId }));
});

const listSessionsController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(200).json(
      new SuccessResponse("Lấy danh sách phiên chat thành công", { sessions: [] }),
    );
  }
  const sessions = await aiChatHistoryService.listUserSessions(
    userId,
    req.query.context,
  );
  return res.status(200).json(
    new SuccessResponse("Lấy danh sách phiên chat thành công", { sessions }),
  );
});

const aiController = {
  chatController,
  chatStreamController,
  getSessionMessagesController,
  clearSessionController,
  deleteSessionController,
  listSessionsController,
};

export default aiController;
