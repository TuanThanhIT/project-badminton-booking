export type AdminFillRateRow = {
  branchId: number;
  branchName: string;
  fillRate: number;
  totalBooked: number;
  totalCapacity: number;
};

export type AdminLowFillSlot = {
  branchId: number;
  branchName: string;
  hour: number;
  hourEnd?: number;
  hourLabel: string;
  fillRate: number;
  bookedCount: number;
  capacity: number;
  courtCount?: number;
  needsPromotion?: boolean;
  suggestion: string;
};

export type AdminPromotionByBranch = {
  branchId: number;
  branchName: string;
  branchFillRate: number;
  totalBooked: number;
  totalCapacity: number;
  slots: AdminLowFillSlot[];
};

export type AdminCustomerInsight = {
  userId: number;
  fullName?: string;
  email?: string;
  /** Tổng đơn đặt cả đời */
  totalBookings: number;
  /** Suất chơi trong khoảng ngày đang phân tích. */
  sessionsLast30Days?: number;
  /** Đơn đặt trong khoảng ngày đang phân tích. */
  ordersLast30Days?: number;
  daysSinceLastBooking?: number | null;
  lastBranchName?: string;
  reason: string;
  suggestedAction?: string;
  rank?: number;
};

export type AdminAiInsights = {
  fillRateByBranch: AdminFillRateRow[];
  fillRateByBranchHour: Array<{
    branchId: number;
    branchName: string;
    hour: number;
    hourEnd?: number;
    hourLabel: string;
    bookedCount: number;
    capacity: number;
    courtCount?: number;
    fillRate: number;
  }>;
  promotionByBranch?: AdminPromotionByBranch[];
  lowFillPromotionSuggestions: AdminLowFillSlot[];
  peakTimeSlots: Array<{
    branchId: number;
    branchName: string;
    hour: number;
    hourEnd?: number;
    hourLabel: string;
    fillRate: number;
    bookedCount?: number;
    capacity?: number;
    courtCount?: number;
  }>;
  likelyReturnCustomers: AdminCustomerInsight[];
  voucherActivationCandidates: AdminCustomerInsight[];
  summary: {
    branchCount: number;
    lowFillSlotCount: number;
    likelyReturnCount: number;
    voucherCandidateCount: number;
    likelyReturnEligibleCount?: number;
    voucherCandidateEligibleCount?: number;
    avgFillRate: number;
    lookbackDays?: number;
    customerLookbackDays?: number;
    periodStart?: string;
    periodEnd?: string;
    vipMinSessions?: number;
    segmentTopK?: number;
  };
  insightType: string;
  modelReady?: boolean;
};

export type AdminRecommendationResponse = {
  insights: AdminAiInsights;
  meta: {
    lookbackDays: number;
    periodStart?: string;
    periodEnd?: string;
    occupancyRowCount: number;
    userActivityCount: number;
  };
  naturalLanguageAnswer?: string;
};
