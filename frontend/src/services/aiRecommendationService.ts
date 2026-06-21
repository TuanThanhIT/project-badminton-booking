import instance from "../utils/axiosCustomize";
import type {
  AdminRecommendationResponse,
  UserRecommendationResponse,
} from "../types/aiRecommendation";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type UserRecommendationParams = {
  topK?: number;
  naturalLanguage?: boolean;
};

export type AdminInsightsParams = {
  lookbackDays?: number;
  lowFillThreshold?: number;
  churnDaysThreshold?: number;
  naturalLanguage?: boolean;
};

export const getUserRecommendations = async (
  params?: UserRecommendationParams,
) => {
  const res = await instance.get<ApiEnvelope<UserRecommendationResponse>>(
    "/user/ai/recommendations",
    { params, timeout: 60000 },
  );
  return res.data.data;
};

export const getPublicRecommendations = async (
  params?: UserRecommendationParams,
) => {
  const res = await instance.get<ApiEnvelope<UserRecommendationResponse>>(
    "/user/ai/recommendations/public",
    { params, timeout: 60000 },
  );
  return res.data.data;
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
  model: {
    ready: boolean;
    modelType?: string;
    sampleCount?: number;
    trainedAt?: string;
    metrics?: {
      accuracy?: number | null;
      rocAuc?: number | null;
    };
  };
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
  recordCount?: number;
  trainResult?: {
    trained?: boolean;
    reason?: string;
    sampleCount?: number;
    metrics?: {
      accuracy?: number | null;
      rocAuc?: number | null;
    };
  };
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
  getUserRecommendations,
  getPublicRecommendations,
  getAdminAiInsights,
  trainAiModel,
  getAiServiceStatus,
};

export default aiRecommendationService;
