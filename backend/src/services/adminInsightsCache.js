import { redisClient } from "../config/redis.js";
import { AI_RECOMMENDATION_DEFAULTS } from "../constants/aiRecommendationConstant.js";

const CACHE_PREFIX = "admin:insights:v1";
const CACHE_TTL_SEC = Number(
  process.env.AI_INSIGHTS_CACHE_TTL_SEC ??
    AI_RECOMMENDATION_DEFAULTS.INSIGHTS_CACHE_TTL_SEC,
);

const buildCacheKey = ({
  lookbackDays,
  lowFillThreshold,
  churnDaysThreshold,
}) =>
  [
    CACHE_PREFIX,
    lookbackDays ?? AI_RECOMMENDATION_DEFAULTS.OCCUPANCY_LOOKBACK_DAYS,
    lowFillThreshold ?? AI_RECOMMENDATION_DEFAULTS.LOW_FILL_THRESHOLD,
    churnDaysThreshold ?? AI_RECOMMENDATION_DEFAULTS.CHURN_DAYS_THRESHOLD,
  ].join(":");

export const getCachedAdminInsights = async (params) => {
  try {
    const raw = await redisClient.get(buildCacheKey(params));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setCachedAdminInsights = async (params, result) => {
  try {
    await redisClient.set(
      buildCacheKey(params),
      JSON.stringify(result),
      "EX",
      CACHE_TTL_SEC,
    );
  } catch {
    // Cache miss is acceptable when Redis is unavailable.
  }
};

export const invalidateAdminInsightsCache = async () => {
  try {
    const keys = await redisClient.keys(`${CACHE_PREFIX}:*`);
    if (keys.length) await redisClient.del(...keys);
  } catch {
    // Ignore cache invalidation errors.
  }
};

export default {
  getCachedAdminInsights,
  setCachedAdminInsights,
  invalidateAdminInsightsCache,
};
