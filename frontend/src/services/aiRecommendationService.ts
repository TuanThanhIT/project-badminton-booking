import instance from "../utils/axiosCustomize";
import type { AdminRecommendationResponse } from "../types/aiRecommendation";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AdminInsightsParams = {
  lookbackDays?: number;
  lowFillThreshold?: number;
  churnDaysThreshold?: number;
  naturalLanguage?: boolean;
};

export const getAdminAiInsights = async (params?: AdminInsightsParams) => {
  const res = await instance.get<ApiEnvelope<AdminRecommendationResponse>>(
    "/admin/ai/insights",
    { params, timeout: 60000 },
  );
  return res.data.data;
};

export const trainAiModel = async () => {
  const res = await instance.post<ApiEnvelope<unknown>>(
    "/admin/ai/train",
    {},
    { timeout: 120000 },
  );
  return res.data.data;
};

export type AiServiceStatus = {
  status: string;
  productModel?: {
    ready: boolean;
    modelType?: string;
    recordCount?: number;
    basketCount?: number;
    trainedAt?: string;
    metrics?: {
      accuracy?: number | null;
      rocAuc?: number | null;
    };
  };
  trainingSchedule: {
    cron: string;
    timezone: string;
  };
};

export type AiTrainResult = {
  productResult?: {
    trained?: boolean;
    reason?: string;
    recordCount?: number;
    basketCount?: number;
    metrics?: {
      accuracy?: number | null;
      rocAuc?: number | null;
    };
  };
};

export const getAiServiceStatus = async () => {
  const res = await instance.get<ApiEnvelope<AiServiceStatus>>(
    "/admin/ai/status",
    { timeout: 30000 },
  );
  return res.data.data;
};

const aiRecommendationService = {
  getAdminAiInsights,
  trainAiModel,
  getAiServiceStatus,
};

export default aiRecommendationService;
