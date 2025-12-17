import type {
  AdminAddDiscountRequest,
  AdminAddDiscountResponse,
  AdminDeleteDiscountRequest,
  AdminDeleteDiscountResponse,
  AdminDiscountListResponse,
  AdminDiscountRequest,
  AdminUpdateDiscountRequest,
  AdminUpdateDiscountResponse,
} from "../../types/discount";
import instance from "../../utils/axiosCustomize";

const getDiscountsService = (data: AdminDiscountRequest) => {
  return instance.get<AdminDiscountListResponse>("/admin/discount/list", {
    params: data,
  });
};

const addDiscountService = (data: AdminAddDiscountRequest) => {
  return instance.post<AdminAddDiscountResponse>("/admin/discount/add", data);
};

const updateDiscountService = (data: AdminUpdateDiscountRequest) => {
  const discountId = data.discountId;
  return instance.patch<AdminUpdateDiscountResponse>(
    `/admin/discount/update/${discountId}`
  );
};

const deleteDiscountService = (data: AdminDeleteDiscountRequest) => {
  const discountId = data.discountId;
  return instance.delete<AdminDeleteDiscountResponse>(
    `/admin/discount/delete/${discountId}`
  );
};
const discountService = {
  getDiscountsService,
  addDiscountService,
  updateDiscountService,
  deleteDiscountService,
};
export default discountService;
