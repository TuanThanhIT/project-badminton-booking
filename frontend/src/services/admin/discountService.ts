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

export interface DiscountRecipient {
  userId: number;
  fullName: string | null;
  email: string;
  isUsed: boolean;
  usedAt: string | null;
}

export interface DiscountRecipientsResponse {
  data: {
    discount: {
      id: number;
      code: string;
      visibility: "PUBLIC" | "PRIVATE";
      type: string;
      value: number;
      usageCount: number;
    };
    recipients: DiscountRecipient[];
    summary: { total: number; used: number };
  };
}

const getDiscountRecipientsService = (discountId: number) =>
  instance.get<DiscountRecipientsResponse>(
    `/admin/discounts/${discountId}/recipients`,
  );

export interface DiscountScopeFields {
  visibility?: "PUBLIC" | "PRIVATE";
  branchId?: number | null;
  startHour?: number | null;
  endHour?: number | null;
}

const createDiscountService = (
  data: {
    code: string;
    type: string;
    applyType: string;
    value: number;
    maxDiscount?: number;
    minAmount?: number;
    usageLimit?: number;
    startDate: string;
    endDate: string;
  } & DiscountScopeFields,
) => instance.post("/admin/discounts", data);

const updateDiscountService = (
  discountId: number,
  data: Partial<
    {
      code: string;
      type: string;
      applyType: string;
      value: number;
      maxDiscount: number;
      minAmount: number;
      usageLimit: number;
      startDate: string;
      endDate: string;
    } & DiscountScopeFields
  >,
) => instance.put(`/admin/discounts/${discountId}`, data);

const createTargetedDiscountService = (
  data: {
    code: string;
    type: string;
    value: number;
    maxDiscount?: number;
    minAmount?: number;
    startDate: string;
    endDate: string;
    segment: "LOYAL" | "WINBACK";
    userIds: number[];
  } & Omit<DiscountScopeFields, "visibility">,
) => instance.post("/admin/discounts/targeted", data);

const toggleDiscountService = (discountId: number) =>
  instance.put(`/admin/discounts/${discountId}/toggle`);

const deleteDiscountService = (discountId: number) =>
  instance.delete(`/admin/discounts/${discountId}`);

const adminDiscountService = {
  getDiscountsService,
  getDiscountRecipientsService,
  createDiscountService,
  createTargetedDiscountService,
  updateDiscountService,
  toggleDiscountService,
  deleteDiscountService,
};

export default adminDiscountService;
