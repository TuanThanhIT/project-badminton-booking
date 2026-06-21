export type BranchRecommendation = {
  branchId: number;
  branchName?: string;
  score: number;
  reason: string;
};

export type TimeSlotRecommendation = {
  hour: number;
  label: string;
  dayOfWeek?: number;
  score: number;
  reason: string;
};

export type PromotionSuggestion = {
  branchId: number;
  branchName?: string;
  discountCode?: string;
  discountValue?: number;
  reason?: string;
};

export type UserAiRecommendation = {
  strategy: string;
  isNewUser: boolean;
  branchRecommendations: BranchRecommendation[];
  timeSlotRecommendations: TimeSlotRecommendation[];
  promotionSuggestions: PromotionSuggestion[];
  modelUsed: boolean;
  modelType?: string;
  modelReady?: boolean;
};

export type UserRecommendationResponse = {
  recommendations: UserAiRecommendation;
  meta: {
    userId: number | null;
    isNewUser: boolean;
    historyCount: number;
  };
  naturalLanguageAnswer?: string;
};

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
  totalBookings: number;
  daysSinceLastBooking?: number | null;
  lastBranchName?: string;
  reason: string;
  suggestedAction?: string;
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
  }>;
  likelyReturnCustomers: AdminCustomerInsight[];
  voucherActivationCandidates: AdminCustomerInsight[];
  summary: {
    branchCount: number;
    lowFillSlotCount: number;
    likelyReturnCount: number;
    voucherCandidateCount: number;
    avgFillRate: number;
  };
  insightType: string;
  modelReady?: boolean;
};

export type AdminRecommendationResponse = {
  insights: AdminAiInsights;
  meta: {
    lookbackDays: number;
    occupancyRowCount: number;
    userActivityCount: number;
  };
  naturalLanguageAnswer?: string;
};
