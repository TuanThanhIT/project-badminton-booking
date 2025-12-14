import type { CountOrderRequest, CountOrderResponse } from "../../types/order";
import instance from "../../utils/axiosCustomize";

const countOrderByOrderStatusService = (data: CountOrderRequest) => {
  return instance.get<CountOrderResponse>("/admin/order/count", {
    params: data,
  });
};

const orderAdminService = {
  countOrderByOrderStatusService,
};

export default orderAdminService;
