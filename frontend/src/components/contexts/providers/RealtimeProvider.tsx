import { useEffect, type ReactNode } from "react";
import { useRealtime } from "../../../hooks/useRealtime";
import { useAppDispatch, useAppSelector } from "../../../redux/hook";
import { getMyBookings } from "../../../redux/slices/user/bookingSlice";
import { addLocalNotification } from "../../../redux/slices/user/notificationSlice";
import {
  getOrderDetail,
  getOrderTracking,
  getTrackingProgress,
  getUserOrders,
  updateOrderShippingRealtime,
} from "../../../redux/slices/user/orderSlice";

// Đây là chỗ quan trọng nhất. App chỉ cần bọc RealtimeProvider, sau đó provider sẽ:

// Có notification mới -> dispatch addLocalNotification
// Có order update mới -> dispatch updateOrderShippingRealtime
// Nếu đang mở đúng đơn -> gọi lại detail/tracking/progress

type RealtimeProviderProps = {
  children: ReactNode;
};

const RealtimeProvider = ({ children }: RealtimeProviderProps) => {
  const dispatch = useAppDispatch();
  const token =
    useAppSelector((state) => state.auth.accessToken) ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    "";

  const currentOrderId = useAppSelector(
    (state) => state.order.orderDetailData?.orderId,
  );

  const { notification, shippingUpdate } = useRealtime(token);

  useEffect(() => {
    if (!notification) return;

    dispatch(addLocalNotification({ notification }));

    if (notification.type?.startsWith("booking-")) {
      dispatch(getMyBookings({ data: { page: 1, limit: 1 } }));
    }

    if (notification.type?.startsWith("order-")) {
      dispatch(getUserOrders({ data: { page: 1, limit: 1, status: "ALL" } }));
    }
  }, [dispatch, notification]);

  useEffect(() => {
    if (!shippingUpdate) return;

    dispatch(updateOrderShippingRealtime(shippingUpdate));

    if (currentOrderId === shippingUpdate.orderId) {
      dispatch(getOrderDetail({ data: { orderId: shippingUpdate.orderId } }));
      dispatch(getOrderTracking({ data: { orderId: shippingUpdate.orderId } }));
      dispatch(
        getTrackingProgress({ data: { orderId: shippingUpdate.orderId } }),
      );
    }
  }, [dispatch, shippingUpdate, currentOrderId]);

  return <>{children}</>;
};

export default RealtimeProvider;
