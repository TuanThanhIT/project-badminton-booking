import { getIO } from "./index.js";
import { SOCKET_EVENTS } from "./socketEvents.js";

// File này là “cổng phát realtime”. Code khác không cần biết Socket.IO chi tiết, chỉ gọi:
// emitOrderShippingUpdated(userId, payload);
// hoặc:
// emitNotificationToUser(userId, payload);

export const emitToUser = (userId, event, data) => {
  getIO().to(`user:${userId}`).emit(event, data);
};

export const emitToRole = (role, event, data) => {
  getIO().to(`role:${role}`).emit(event, data);
};

export const emitToAll = (event, data) => {
  getIO().emit(event, data);
};

export const emitNotificationToUser = (userId, data) => {
  emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_NEW, data);
};

export const emitNotificationToRole = (role, data) => {
  emitToRole(role, SOCKET_EVENTS.NOTIFICATION_NEW, data);
};

export const emitOrderShippingUpdated = (userId, data) => {
  emitToUser(userId, SOCKET_EVENTS.ORDER_SHIPPING_UPDATED, data);
};
