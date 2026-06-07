import { Server as IOServer } from "socket.io";
import { StatusCodes } from "http-status-codes";

import ApiError from "../errors/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import {
  ConversationParticipant,
  User,
} from "../models/index.js";
import {
  addUserSocket,
  clearOfflineTimer,
  removeUserSocket,
  scheduleOffline,
} from "./presenceManager.js";
import { SOCKET_EVENTS } from "./socketEvents.js";

// File này tạo Socket.IO server. Khi frontend connect lên, backend lấy token, verify JWT, rồi cho socket vào room riêng:

// user:5
// role:USER
// Nhờ vậy muốn gửi realtime cho user nào thì emit vào đúng room user đó.

let io = null;

const getRelatedPresenceUserIds = async (userId) => {
  const memberships = await ConversationParticipant.findAll({
    where: { userId },
    attributes: ["conversationId"],
  });

  const conversationIds = memberships.map((row) => row.conversationId);
  if (!conversationIds.length) return [Number(userId)];

  const participants = await ConversationParticipant.findAll({
    where: { conversationId: conversationIds },
    attributes: ["userId"],
  });

  return [...new Set([Number(userId), ...participants.map((p) => Number(p.userId))])];
};

const emitPresenceToRelatedUsers = async (userId, payload) => {
  const relatedUserIds = await getRelatedPresenceUserIds(userId);
  relatedUserIds.forEach((relatedUserId) => {
    io.to(`user:${relatedUserId}`).emit(
      payload.isOnline
        ? SOCKET_EVENTS.PRESENCE_USER_ONLINE
        : SOCKET_EVENTS.PRESENCE_USER_OFFLINE,
      payload,
    );
  });
};

const markUserOnline = async (userId) => {
  await User.update(
    { isOnline: true, lastSeenAt: null },
    { where: { id: userId } },
  );

  await emitPresenceToRelatedUsers(userId, {
    userId: Number(userId),
    isOnline: true,
    lastSeenAt: null,
  });
};

const markUserOffline = async (userId) => {
  const lastSeenAt = new Date();

  await User.update(
    { isOnline: false, lastSeenAt },
    { where: { id: userId } },
  );

  await emitPresenceToRelatedUsers(userId, {
    userId: Number(userId),
    isOnline: false,
    lastSeenAt: lastSeenAt.toISOString(),
  });
};

export const initSocket = (httpServer) => {
  User.update({ isOnline: false }, { where: { isOnline: true } }).catch((error) => {
    console.error("Unable to reset stale online users:", error.message);
  });

  io = new IOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Middleware xác thực JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "NO_TOKEN"));
    }

    try {
      const decoded = verifyAccessToken(token);

      // Lưu info user vào socket
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;

      return next();
    } catch (error) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "INVALID_TOKEN"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("Socket connected: ", socket.id, socket.data);
    const userId = socket.data.userId;
    const role = socket.data.role;
    const socketCount = addUserSocket(userId, socket.id);
    clearOfflineTimer(userId);

    // Join room theo userId
    socket.join(`user:${userId}`);

    // Join role room
    socket.join(`role:${role}`);

    if (socketCount === 1) {
      markUserOnline(userId).catch((error) => {
        console.error("Unable to mark user online:", error.message);
      });
    }

    socket.on("chat:join", async (conversationId) => {
      if (!conversationId) return;
      const membership = await ConversationParticipant.findOne({
        where: { conversationId, userId },
        attributes: ["conversationId"],
      });

      if (membership) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on("chat:leave", (conversationId) => {
      if (!conversationId) return;
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      const remainingSockets = removeUserSocket(userId, socket.id);

      if (remainingSockets === 0) {
        scheduleOffline(userId, markUserOffline);
      }
    });
  });
  return io;
};

export const getIO = () => {
  if (!io)
    throw new ApiError(StatusCodes.BAD_REQUEST, "Socket.IO not initialized!");
  return io;
};
