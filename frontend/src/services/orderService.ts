import {
  type OrderListResponse,
  type AddOrderRequest,
  type AddOrderResponse,
  type OrderCancelRequest,
  type OrderCancelResponse,
  type MoMoPaymentResponse,
  type MomoPaymentRequest,
} from "../types/order";
import instance from "../utils/axiosCustomize";

const createOrderService = (data: AddOrderRequest) =>
  instance.post<AddOrderResponse>("/user/order/add", data);

const getOrderService = () =>
  instance.get<OrderListResponse>("/user/order/list");

const cancelOrderService = (data: OrderCancelRequest) => {
  const orderId = data.orderId;
  const cancelReason = data.cancelReason;
  return instance.patch<OrderCancelResponse>(
    `/user/order/cancel/${orderId}`,
    cancelReason
  );
};

const createMoMoPaymentService = async (data: MomoPaymentRequest) => {
  return instance.post<MoMoPaymentResponse>(
    "/user/momo/create-momo-payment",
    data
  );
};
const OrderService = {
  createOrderService,
  getOrderService,
  cancelOrderService,
  createMoMoPaymentService,
};
export default OrderService;
