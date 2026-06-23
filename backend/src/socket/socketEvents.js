export const SOCKET_EVENTS = Object.freeze({
  NOTIFICATION_NEW: "notification:new",
  ORDER_SHIPPING_UPDATED: "order:shipping-updated",
  PRESENCE_USER_ONLINE: "presence:user-online",
  PRESENCE_USER_OFFLINE: "presence:user-offline",
  ACCOUNT_LOCKED: "account:locked",
});

// File này chỉ gom tên event lại một chỗ. Sau này khỏi viết string rải rác.
