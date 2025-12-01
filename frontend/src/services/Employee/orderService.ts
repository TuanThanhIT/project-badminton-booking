import type {
  OrderCancelEplRequest,
  OrderCancelEplResponse,
  OrderCompleteRequest,
  OrderCompleteResponse,
  OrderConfirmRequest,
  OrderConfirmResponse,
  OrderEplRequest,
  OrderListEplResponse,
} from "../../types/order";
import instance from "../../utils/axiosCustomize";

const getOrdersService = (data: OrderEplRequest) => {
  return instance.get<OrderListEplResponse>("/employee/order/list", {
    params: data,
  });
};

const confirmOrderService = (data: OrderConfirmRequest) => {
  const { orderId } = data;
  return instance.patch<OrderConfirmResponse>(
    `/employee/order/confirm/${orderId}`
  );
};

const completeOrderService = (data: OrderCompleteRequest) => {
  const { orderId } = data;
  return instance.patch<OrderCompleteResponse>(
    `/employee/order/complete/${orderId}`
  );
};

const cancelOrderService = (data: OrderCancelEplRequest) => {
  const orderId = data.orderId;
  const cancelReason = data.cancelReason;
  return instance.patch<OrderCancelEplResponse>(
    `/employee/order/cancel/${orderId}`,
    { cancelReason }
  );
};

const orderService = {
  getOrdersService,
  confirmOrderService,
  completeOrderService,
  cancelOrderService,
};
export default orderService;
