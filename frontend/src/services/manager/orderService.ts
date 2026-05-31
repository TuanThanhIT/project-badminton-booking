import instance from "../../utils/axiosCustomize";
import type {
  ManagerOrderDetailResponse,
  ManagerMonthlyHighlightsRequest,
  ManagerMonthlyHighlightsResponse,
  ManagerOrdersRequest,
  ManagerOrdersResponse,
} from "../../types/order";

///MANAGER
const getOrdersService = (params: ManagerOrdersRequest) =>
  instance.get<ManagerOrdersResponse>("/manager/orders", { params });

///MANAGER
const getOrderDetailService = (orderId: number) =>
  instance.get<ManagerOrderDetailResponse>(`/manager/orders/${orderId}`);

const getMonthlyHighlightsService = (params?: ManagerMonthlyHighlightsRequest) =>
  instance.get<ManagerMonthlyHighlightsResponse>("/manager/orders/monthly-highlights", {
    params,
  });

///MANAGER
const managerOrderService = {
  getOrdersService,
  getOrderDetailService,
  getMonthlyHighlightsService,
};

export default managerOrderService;
