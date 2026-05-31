import { io, Socket } from "socket.io-client";

// Đây là socket singleton. Nghĩa là toàn app cố gắng dùng chung 1 socket connection, tránh mỗi page mở một socket riêng.

const URL =
  (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:8088";

export let socket: Socket | null = null;
let currentToken: string | null = null;

export const connectSocket = (token: string) => {
  if (socket && currentToken === token) {
    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  currentToken = token;
  socket = io(URL, {
    auth: { token },
    autoConnect: true,
  });

  socket.on("connect_error", (err) => {
    console.log("Socket error: ", err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
  currentToken = null;
};
