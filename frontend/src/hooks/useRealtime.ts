import { useEffect, useState } from "react";
import { connectSocket } from "../socket";
import { toast } from "react-toastify";
import type { NotificationResponse } from "../types/notification";

export const useRealtime = (token: string) => {
  const [notification, setNotification] = useState<NotificationResponse>();

  useEffect(() => {
    if (!token) return;

    const s = connectSocket(token);

    s.on("connect", () => console.log("🔥 SOCKET CONNECTED"));

    // Danh sách event
    const events = [
      "cancel-order",
      "create-order",
      "create-booking",
      "cancel-booking",
      "epl-confirm-order",
      "epl-complete-order",
      "epl-cancel-order",
      "epl-confirm-booking",
      "epl-complete-booking",
      "epl-cancel-booking",
    ] as const;

    // Lắng nghe tất cả event
    events.forEach((eventName) => {
      s.on(eventName, (data) => {
        toast.info(data.message);

        const newNotification = {
          ...data,
          type: eventName,
        };

        setNotification(newNotification);
      });
    });

    return () => {
      events.forEach((eventName) => s.off(eventName));
      s.disconnect();
    };
  }, [token]);

  return { notification, setNotification };
};
