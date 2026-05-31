import { Server as IOServer } from "socket.io";
import { StatusCodes } from "http-status-codes";

import ApiError from "../errors/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

// File này tạo Socket.IO server. Khi frontend connect lên, backend lấy token, verify JWT, rồi cho socket vào room riêng:

// user:5
// role:USER
// Nhờ vậy muốn gửi realtime cho user nào thì emit vào đúng room user đó.

let io = null;
export const initSocket = (httpServer) => {
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

  io.on("connection", (socket) => {
    console.log("Socket connected: ", socket.id, socket.data);
    const userId = socket.data.userId;
    const role = socket.data.role;

    // Join room theo userId
    socket.join(`user:${userId}`);

    // Join role room
    socket.join(`role:${role}`);

    socket.on("chat:join", (conversationId) => {
      if (!conversationId) return;
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
  return io;
};

export const getIO = () => {
  if (!io)
    throw new ApiError(StatusCodes.BAD_REQUEST, "Socket.IO not initialized!");
  return io;
};
