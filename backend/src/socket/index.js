import { Server as IOServer } from "socket.io";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import ApiError from "../utils/ApiError.js";

let io = null;
export const initSocket = (httpServer) => {
  io = new IOServer(httpServer, {
    cors: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  });

  // Middleware xác thực JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new ApiError(StatusCodes.NOT_FOUND, "NO_TOKEN"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Lưu info user vào socket
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;

      return next();
    } catch (error) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, "INVALID_TOKEN"));
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
