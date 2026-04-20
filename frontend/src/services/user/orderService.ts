import type {
  CalculateShippingRequest,
  CheckoutPreviewRequest,
  CheckoutPreviewResponse,
} from "../../types/order";
import instance from "../../utils/axiosCustomize";

const getCheckoutPreviewService = (data: CheckoutPreviewRequest) =>
  instance.post<CheckoutPreviewResponse>("/user/orders/checkout/preview", data);

const calculateShippingService = (data: CalculateShippingRequest) =>
  instance.post<CheckoutPreviewResponse>(
    "/user/orders/checkout/shipping",
    data,
  );

const orderService = {
  getCheckoutPreviewService,
  calculateShippingService,
};

export default orderService;
