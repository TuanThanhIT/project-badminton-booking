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
      "epl-cancel-order",
      "epl-create-order",
      "epl-create-booking",
      "epl-cancel-booking",

      "us-confirm-order",
      "us-complete-order",
      "us-cancel-order",
      "us-confirm-booking",
      "us-complete-booking",
      "us-cancel-booking",

      "adm-cancel-order",
      "adm-create-order",
      "adm-create-booking",
      "adm-cancel-booking",
      "adm-confirm-order",
      "adm-complete-order",
      "adm-cancel-order",
      "adm-confirm-booking",
      "adm-complete-booking",
      "adm-cancel-booking",
      "adm-check-in",
      "adm-check-out",
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
