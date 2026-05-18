import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { connectSocket, disconnectSocket } from "../socket";
import type { NotificationResponse } from "../types/notification";
import type { OrderShippingRealtimePayload } from "../types/order";

// Hook này chỉ nghe socket, không dispatch Redux trực tiếp. Nó trả ra 2 loại data:

// notification   -> thông báo chuông
// shippingUpdate -> cập nhật đơn hàng

const SOCKET_EVENTS = {
  NOTIFICATION_NEW: "notification:new",
  ORDER_SHIPPING_UPDATED: "order:shipping-updated",
} as const;

export const useRealtime = (token: string) => {
  const [notification, setNotification] = useState<NotificationResponse>();
  const [shippingUpdate, setShippingUpdate] =
    useState<OrderShippingRealtimePayload>();

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

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW);
      socket.off(SOCKET_EVENTS.ORDER_SHIPPING_UPDATED);
      socket.off("connect");
      socket.off("disconnect");
      disconnectSocket();
    };
  }, [token]);

  return {
    notification,
    shippingUpdate,
  };
};
