import { useEffect } from "react";
import { socket } from "../../socket";
import { useAppDispatch } from "../hook";
import { updateOrderShippingRealtime } from "../slices/user/orderSlice";
import type { OrderShippingRealtimePayload } from "../../types/order";

export const useOrderStatusSocket = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const currentSocket = socket;
    if (!currentSocket) return;

    // Listen for order status updates
    currentSocket.on("order:shipping-updated", (data: OrderShippingRealtimePayload) => {
      // Data from backend:
      // {
      //   orderId,
      //   orderGroupId,
      //   orderStatus,
      //   shippingStatus,
      //   displayStatus,
      //   deliveredAt,
      //   tracking: { id, status, time },
      //   message
      // }

      dispatch(updateOrderShippingRealtime(data));

      // Show notification toast if needed
      if (data.message) {
        console.log("Order update: ", data.message);
      }
    });

    return () => {
      currentSocket.off("order:shipping-updated");
    };
  }, [dispatch]);
};
