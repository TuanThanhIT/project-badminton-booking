import {
  type OrderListResponse,
  type AddOrderRequest,
  type AddOrderResponse,
  type OrderCancelRequest,
  type OrderCancelResponse,
} from "../types/order";
import instance from "../utils/axiosCustomize";

const createOrderService = (data: AddOrderRequest) =>
  instance.post<AddOrderResponse>("/user/order/add", data);

const getOrderService = () =>
  instance.get<OrderListResponse>("/user/order/list");

const cancelOrderService = (data: OrderCancelRequest) => {
  const orderId = data.orderId;
  const cancelReason = data.cancelReason;
  return instance.patch<OrderCancelResponse>(`/user/order/cancel/${orderId}`, {
    cancelReason,
  });
};

const orderService = {
  createOrderService,
  getOrderService,
  cancelOrderService,
};
export default orderService;
