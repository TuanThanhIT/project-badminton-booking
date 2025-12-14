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

const getDiscountBookingsService = (data: AdminDiscountRequest) => {
  return instance.get<AdminDiscountListResponse>(
    "/admin/discount/booking/list",
    {
      params: data,
    }
  );
};

const addDiscountBookingService = (data: AdminAddDiscountRequest) => {
  return instance.post<AdminAddDiscountResponse>(
    "/admin/discount/booking/add",
    data
  );
};

const updateDiscountDiscountService = (data: AdminUpdateDiscountRequest) => {
  const discountId = data.discountId;
  return instance.patch<AdminUpdateDiscountResponse>(
    `/admin/discount/booking/update/${discountId}`
  );
};

const deleteDiscountBookingService = (data: AdminDeleteDiscountRequest) => {
  const discountId = data.discountId;
  return instance.delete<AdminDeleteDiscountResponse>(
    `/admin/discount/booking/delete/${discountId}`
  );
};
const discountBookingService = {
  getDiscountBookingsService,
  addDiscountBookingService,
  updateDiscountDiscountService,
  deleteDiscountBookingService,
};
export default discountBookingService;
