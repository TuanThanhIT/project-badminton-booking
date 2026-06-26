/** sessionStorage key — AI Insights → trang Khuyến mãi (form tạo mã theo mẫu nhóm). */
export const DISCOUNT_PREFILL_STORAGE_KEY = "bhub-discount-prefill";

export type DiscountSegmentDraft = {
  code: string;
  type: "PERCENT" | "AMOUNT";
  applyType: "BOOKING" | "ORDER" | "ALL";
  value: number;
  maxDiscount?: number;
  minAmount: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  segmentLabel?: string;
  // Phạm vi đặt sân (điền sẵn khi tạo mã cho khung giờ trống của 1 chi nhánh).
  branchId?: number;
  branchName?: string;
  startHour?: number;
  endHour?: number;
};
