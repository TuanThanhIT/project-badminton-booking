import type {
  MomoPaymentRequest,
  MoMoPaymentResponse,
} from "../../types/order";
import instance from "../../utils/axiosCustomize";

const createMoMoPaymentService = async (data: MomoPaymentRequest) => {
  return instance.post<MoMoPaymentResponse>(
    "/user/momo/create-momo-payment",
    data
  );
};

const momoService = {
  createMoMoPaymentService,
};
export default momoService;
