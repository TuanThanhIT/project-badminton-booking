import { getIO } from "./index.js";

export const notifyEmployees = (event, data) => {
  getIO().to("role:EMPLOYEE").emit(event, data);
};

export const notifyUser = (userId, event, data) => {
  getIO().to(`user:${userId}`).emit(event, data);
};

export const notifyAdmin = (event, data) => {
  getIO().to("role:ADMIN").emit(event, data);
};

export const notifyAll = (event, data) => {
  getIO().emit(event, data);
};
