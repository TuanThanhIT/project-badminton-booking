const userSockets = new Map();
const offlineTimers = new Map();

export const PRESENCE_OFFLINE_GRACE_MS = 8000;

const normalizeUserId = (userId) => Number(userId);

export const addUserSocket = (userId, socketId) => {
  const normalizedUserId = normalizeUserId(userId);
  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) return 0;

  if (!userSockets.has(normalizedUserId)) {
    userSockets.set(normalizedUserId, new Set());
  }

  userSockets.get(normalizedUserId).add(socketId);
  return userSockets.get(normalizedUserId).size;
};

export const removeUserSocket = (userId, socketId) => {
  const normalizedUserId = normalizeUserId(userId);
  const sockets = userSockets.get(normalizedUserId);

  if (!sockets) return 0;

  sockets.delete(socketId);

  if (sockets.size === 0) {
    userSockets.delete(normalizedUserId);
    return 0;
  }

  return sockets.size;
};

export const isUserOnline = (userId) => {
  const sockets = userSockets.get(normalizeUserId(userId));
  return Boolean(sockets?.size);
};

export const getOnlineUserIds = () => [...userSockets.keys()];

export const getUserSocketCount = (userId) =>
  userSockets.get(normalizeUserId(userId))?.size || 0;

export const clearOfflineTimer = (userId) => {
  const normalizedUserId = normalizeUserId(userId);
  const timer = offlineTimers.get(normalizedUserId);

  if (timer) {
    clearTimeout(timer);
    offlineTimers.delete(normalizedUserId);
  }
};

export const scheduleOffline = (userId, callback, delay = PRESENCE_OFFLINE_GRACE_MS) => {
  const normalizedUserId = normalizeUserId(userId);
  clearOfflineTimer(normalizedUserId);

  const timer = setTimeout(async () => {
    offlineTimers.delete(normalizedUserId);
    if (isUserOnline(normalizedUserId)) return;
    await callback(normalizedUserId);
  }, delay);

  offlineTimers.set(normalizedUserId, timer);
  return timer;
};

export const resetPresenceMemory = () => {
  offlineTimers.forEach((timer) => clearTimeout(timer));
  offlineTimers.clear();
  userSockets.clear();
};
