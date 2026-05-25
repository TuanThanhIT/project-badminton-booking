import instance from "../../utils/axiosCustomize";

export interface AdminDiscountsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  applyType?: string;
  isActive?: string;
}

const getDiscountsService = (params: AdminDiscountsParams) =>
  instance.get("/admin/discounts", { params });

const createDiscountService = (data: {
  code: string;
  type: string;
  applyType: string;
  value: number;
  maxDiscount?: number;
  minAmount?: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
}) => instance.post("/admin/discounts", data);

const updateDiscountService = (discountId: number, data: Partial<{
  code: string;
  type: string;
  applyType: string;
  value: number;
  maxDiscount: number;
  minAmount: number;
  usageLimit: number;
  startDate: string;
  endDate: string;
}>) => instance.put(`/admin/discounts/${discountId}`, data);

const toggleDiscountService = (discountId: number) =>
  instance.put(`/admin/discounts/${discountId}/toggle`);

const deleteDiscountService = (discountId: number) =>
  instance.delete(`/admin/discounts/${discountId}`);

const adminDiscountService = {
  getDiscountsService,
  createDiscountService,
  updateDiscountService,
  toggleDiscountService,
  deleteDiscountService,
};

export default adminDiscountService;
