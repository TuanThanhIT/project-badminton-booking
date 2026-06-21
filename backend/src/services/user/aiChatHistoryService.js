import {
  AI_HISTORY_LIMIT,
  AI_MESSAGE_ROLE,
} from "../../constants/aiConstant.js";
import BadRequestError from "../../errors/BadRequestError.js";
import ForbiddenError from "../../errors/ForbiddenError.js";
import { AiChatMessage, AiChatSession } from "../../models/index.js";
import { createRandomId } from "../../utils/randomId.js";

const truncateTitle = (text, max = 100) => {
  const trimmed = String(text || "").trim();
  if (!trimmed) return null;
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
};

export const assertSessionAccess = (session, { userId, guestToken }) => {
  if (!session) {
    throw new BadRequestError("Phiên chat không tồn tại.");
  }
  if (session.userId) {
    if (!userId || session.userId !== userId) {
      throw new ForbiddenError("Bạn không có quyền truy cập phiên chat này.");
    }
    return;
  }
  if (!guestToken || session.guestToken !== guestToken) {
    throw new ForbiddenError("Bạn không có quyền truy cập phiên chat này.");
  }
};

export const resolveSession = async ({
  sessionId,
  userId,
  guestToken,
  context,
  branchId,
  courtId,
  productId,
  message,
}) => {
  if (sessionId) {
    const session = await AiChatSession.findByPk(sessionId);
    assertSessionAccess(session, { userId, guestToken });
    if (session.context !== context) {
      await session.update({ context });
    }
    return { session, guestToken: session.guestToken };
  }

  const token = userId ? null : guestToken || createRandomId();
  const session = await AiChatSession.create({
    userId: userId || null,
    guestToken: token,
    context,
    branchId: branchId || null,
    courtId: courtId || null,
    productId: productId || null,
    title: truncateTitle(message),
  });

  return { session, guestToken: token };
};

export const loadSessionMessages = async (sessionId, limit = AI_HISTORY_LIMIT) => {
  const rows = await AiChatMessage.findAll({
    where: { sessionId },
    attributes: ["id", "role", "content", "createdAt"],
    order: [["createdAt", "DESC"]],
    limit,
  });

  return rows.reverse();
};

export const appendSessionMessage = async (sessionId, role, content) => {
  const text = String(content || "").trim();
  if (!text) return null;

  const message = await AiChatMessage.create({
    sessionId,
    role,
    content: text,
  });

  await AiChatSession.update(
    { updatedAt: new Date() },
    { where: { id: sessionId } },
  );

  return message;
};

export const clearSessionMessages = async (sessionId, access) => {
  const session = await AiChatSession.findByPk(sessionId);
  assertSessionAccess(session, access);
  await AiChatMessage.destroy({ where: { sessionId } });
  await session.update({ title: null, updatedAt: new Date() });
  return session;
};

export const deleteSession = async (sessionId, access) => {
  const session = await AiChatSession.findByPk(sessionId);
  assertSessionAccess(session, access);
  await AiChatMessage.destroy({ where: { sessionId } });
  await session.destroy();
};

export const listUserSessions = async (userId, context) => {
  const where = { userId };
  if (context) where.context = context;

  return AiChatSession.findAll({
    where,
    attributes: ["id", "context", "title", "updatedAt", "createdAt"],
    order: [["updatedAt", "DESC"]],
    limit: 20,
  });
};

export const messagesToPromptHistory = (rows) =>
  rows
    .filter((m) =>
      [AI_MESSAGE_ROLE.USER, AI_MESSAGE_ROLE.ASSISTANT].includes(m.role),
    )
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));

export default {
  resolveSession,
  loadSessionMessages,
  appendSessionMessage,
  clearSessionMessages,
  deleteSession,
  listUserSessions,
  assertSessionAccess,
  messagesToPromptHistory,
};
