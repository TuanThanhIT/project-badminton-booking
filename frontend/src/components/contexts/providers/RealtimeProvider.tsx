import { useEffect, type ReactNode } from "react";
import { useRealtime } from "../../../hooks/useRealtime";
import { useAppDispatch, useAppSelector } from "../../../redux/hook";
import { addLocalNotification } from "../../../redux/slices/user/notificationSlice";
import {
  getOrderDetail,
  getOrderTracking,
  getTrackingProgress,
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
