import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { connectSocket, disconnectSocket } from "../socket";
import type { ChatMessage, PresencePayload } from "../types/message";
import type { NotificationResponse } from "../types/notification";
import type { OrderShippingRealtimePayload } from "../types/order";
import type { AccountLockPayload } from "../utils/forceLogout";

const SOCKET_EVENTS = {
  NOTIFICATION_NEW: "notification:new",
  ORDER_SHIPPING_UPDATED: "order:shipping-updated",
  CHAT_NEW_MESSAGE: "chat:new-message",
  CHAT_MESSAGES_READ: "chat:messages-read",
  CHAT_CONVERSATION_UPDATED: "chat:conversation-updated",
  PRESENCE_USER_ONLINE: "presence:user-online",
  PRESENCE_USER_OFFLINE: "presence:user-offline",
  ACCOUNT_LOCKED: "account:locked",
} as const;

export const useRealtime = (token: string) => {
  const [notification, setNotification] = useState<NotificationResponse>();
  const [shippingUpdate, setShippingUpdate] =
    useState<OrderShippingRealtimePayload>();
  const [chatMessage, setChatMessage] = useState<ChatMessage>();
  const [chatMessagesRead, setChatMessagesRead] = useState<{
    conversationId: number;
    readerId: number;
  }>();
  const [chatConversationUpdated, setChatConversationUpdated] = useState<{
    conversationId: number;
    action?: string;
  }>();
  const [presence, setPresence] = useState<PresencePayload>();
  const [accountLocked, setAccountLocked] = useState<AccountLockPayload>();

  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    socket.on("connect", () => {
      console.log("SOCKET CONNECTED:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("SOCKET DISCONNECTED");
    });

    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, (data: NotificationResponse) => {
      toast.info(data.message);
      setNotification(data);
    });

    socket.on(
      SOCKET_EVENTS.ORDER_SHIPPING_UPDATED,
      (data: OrderShippingRealtimePayload) => {
        toast.info(data.message || "Trạng thái đơn hàng vừa được cập nhật");
        setShippingUpdate(data);
      },
    );

    socket.on(SOCKET_EVENTS.CHAT_NEW_MESSAGE, (data: ChatMessage) => {
      setChatMessage(data);
    });

    socket.on(
      SOCKET_EVENTS.CHAT_MESSAGES_READ,
      (data: { conversationId: number; readerId: number }) => {
        setChatMessagesRead(data);
      },
    );

    socket.on(
      SOCKET_EVENTS.CHAT_CONVERSATION_UPDATED,
      (data: { conversationId: number; action?: string }) => {
        setChatConversationUpdated(data);
      },
    );

    const handlePresence = (data: PresencePayload) => {
      setPresence(data);
    };

    socket.on(SOCKET_EVENTS.PRESENCE_USER_ONLINE, handlePresence);
    socket.on(SOCKET_EVENTS.PRESENCE_USER_OFFLINE, handlePresence);
    socket.on(SOCKET_EVENTS.ACCOUNT_LOCKED, setAccountLocked);

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW);
      socket.off(SOCKET_EVENTS.ORDER_SHIPPING_UPDATED);
      socket.off(SOCKET_EVENTS.CHAT_NEW_MESSAGE);
      socket.off(SOCKET_EVENTS.CHAT_MESSAGES_READ);
      socket.off(SOCKET_EVENTS.CHAT_CONVERSATION_UPDATED);
      socket.off(SOCKET_EVENTS.PRESENCE_USER_ONLINE, handlePresence);
      socket.off(SOCKET_EVENTS.PRESENCE_USER_OFFLINE, handlePresence);
      socket.off(SOCKET_EVENTS.ACCOUNT_LOCKED, setAccountLocked);
      socket.off("connect");
      socket.off("disconnect");
      disconnectSocket();
    };
  }, [token]);

  return {
    notification,
    shippingUpdate,
    chatMessage,
    chatMessagesRead,
    chatConversationUpdated,
    presence,
    accountLocked,
  };
};
