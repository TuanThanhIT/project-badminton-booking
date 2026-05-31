import instance from "../../utils/axiosCustomize";
import type {
  EmployeeOrderActionResponse,
  EmployeeOrderDetailResponse,
  EmployeeOrdersRequest,
  EmployeeOrdersResponse,
  RejectEmployeeOrderActionRequest,
} from "../../types/order";

const getOrdersService = (params: EmployeeOrdersRequest) =>
  instance.get<EmployeeOrdersResponse>("/employee/orders", { params });

const getOrderDetailService = (orderId: number) =>
  instance.get<EmployeeOrderDetailResponse>(`/employee/orders/${orderId}`);

const confirmOrderService = (orderId: number) =>
  instance.patch<EmployeeOrderActionResponse>(
    `/employee/orders/${orderId}/confirm`,
  );

const prepareOrderService = (orderId: number) =>
  instance.patch<EmployeeOrderActionResponse>(
    `/employee/orders/${orderId}/prepare`,
  );

const readyToShipService = (orderId: number) =>
  instance.patch<EmployeeOrderActionResponse>(
    `/employee/orders/${orderId}/ready-to-ship`,
  );

const shipOrderService = (orderId: number) =>
  instance.patch<EmployeeOrderActionResponse>(
    `/employee/orders/${orderId}/ship`,
  );

const approveCancelService = (orderId: number) =>
  instance.post<EmployeeOrderActionResponse>(
    `/employee/orders/${orderId}/cancel/approve`,
  );

const rejectCancelService = (
  orderId: number,
  data: RejectEmployeeOrderActionRequest,
) =>
  instance.post<EmployeeOrderActionResponse>(
    `/employee/orders/${orderId}/cancel/reject`,
    data,
  );

const approveReturnService = (orderId: number) =>
  instance.post<EmployeeOrderActionResponse>(
    `/employee/orders/${orderId}/return/approve`,
  );

const completeReturnService = (orderId: number) =>
  instance.post<EmployeeOrderActionResponse>(
    `/employee/orders/${orderId}/return/complete`,
  );

const forceReturnGHNService = (orderId: number) =>
  instance.post<EmployeeOrderActionResponse>(
    `/employee/orders/${orderId}/ghn-return`,
  );

const employeeOrderService = {
  getOrdersService,
  getOrderDetailService,
  confirmOrderService,
  prepareOrderService,
  readyToShipService,
  shipOrderService,
  approveCancelService,
  rejectCancelService,
  approveReturnService,
  completeReturnService,
  forceReturnGHNService,
};

export default employeeOrderService;
