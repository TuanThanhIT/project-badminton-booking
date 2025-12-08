import { io, Socket } from "socket.io-client";

const URL =
  (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:8088";

export let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  socket = io(URL, {
    auth: { token },
    autoConnect: true,
  });

  socket.on("connect_error", (err) => {
    console.log("Socket error: ", err.message);
  });

  return socket;
};
