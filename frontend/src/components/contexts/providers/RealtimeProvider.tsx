import { useEffect, type ReactNode } from "react";
import { useRealtime } from "../../../hooks/useRealtime";
import { useAppDispatch, useAppSelector } from "../../../redux/hook";
import { getMyBookings } from "../../../redux/slices/user/bookingSlice";
import {
  appendSocketMessage,
  clearUnreadFromSocket,
  getConversations,
  removeConversationLocal,
  userPresenceChanged,
} from "../../../redux/slices/user/conversationSlice";
import { addLocalNotification } from "../../../redux/slices/user/notificationSlice";
import {
  getOrderDetail,
  getOrderTracking,
  getTrackingProgress,
  getUserOrders,
  updateOrderShippingRealtime,
} from "../../../redux/slices/user/orderSlice";
import { getManagerOrders } from "../../../redux/slices/manager/orderSlice";
import {
  appendManagerSocketMessage,
  clearManagerUnreadFromSocket,
  getManagerConversations,
  managerUserPresenceChanged,
  removeManagerConversationLocal,
} from "../../../redux/slices/manager/conversationSlice";
import { forceLogoutUser } from "../../../utils/forceLogout";

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
  const authUser = useAppSelector((state) => state.auth.user);
  const role = authUser?.role;

  const {
    notification,
    shippingUpdate,
    chatMessage,
    chatMessagesRead,
    chatConversationUpdated,
    presence,
    accountLocked,
  } = useRealtime(token);

  useEffect(() => {
    if (!accountLocked) return;

    forceLogoutUser(accountLocked, {
      message:
        accountLocked.message ||
        "Tài khoản của bạn đã bị khóa do vi phạm quy định cộng đồng.",
    });
  }, [accountLocked]);

  useEffect(() => {
    if (!notification) return;

    dispatch(addLocalNotification({ notification }));

    if (role === "MANAGER") {
      if (notification.type?.startsWith("order-")) {
        dispatch(getManagerOrders({ page: 1, limit: 10 }));
      }
      return;
    }

    if (notification.type?.startsWith("booking-")) {
      dispatch(getMyBookings({ data: { page: 1, limit: 1 } }));
    }

    if (notification.type?.startsWith("order-")) {
      dispatch(getUserOrders({ data: { page: 1, limit: 1, status: "ALL" } }));
    }
  }, [dispatch, notification, role]);

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

  useEffect(() => {
    if (!authUser?.id || !chatMessage) return;

    if (role === "MANAGER") {
      dispatch(
        appendManagerSocketMessage({
          message: chatMessage,
          currentUserId: authUser.id,
        }),
      );
      return;
    }

    dispatch(
      appendSocketMessage({
        message: chatMessage,
        currentUserId: authUser.id,
      }),
    );
  }, [dispatch, role, authUser?.id, chatMessage]);

  useEffect(() => {
    if (!authUser?.id || !chatMessagesRead) return;

    if (role === "MANAGER") {
      dispatch(
        clearManagerUnreadFromSocket({
          ...chatMessagesRead,
          selfId: authUser.id,
        }),
      );
      return;
    }

    dispatch(
      clearUnreadFromSocket({
        ...chatMessagesRead,
        selfId: authUser.id,
      }),
    );
  }, [dispatch, role, authUser?.id, chatMessagesRead]);

  useEffect(() => {
    if (!chatConversationUpdated) return;

    if (chatConversationUpdated.action === "deleted") {
      dispatch(
        role === "MANAGER"
          ? removeManagerConversationLocal(chatConversationUpdated.conversationId)
          : removeConversationLocal(chatConversationUpdated.conversationId),
      );
      return;
    }

    dispatch(role === "MANAGER" ? getManagerConversations() : getConversations());
  }, [dispatch, role, chatConversationUpdated]);

  useEffect(() => {
    if (!presence) return;

    dispatch(
      role === "MANAGER"
        ? managerUserPresenceChanged(presence)
        : userPresenceChanged(presence),
    );
  }, [dispatch, role, presence]);

  return <>{children}</>;
};

export default RealtimeProvider;
