import dotenv from "dotenv";
import {
  AI_RECOMMENDATION_AUDIENCE,
  AI_RECOMMENDATION_DEFAULTS,
  AI_TRAINING_JOB,
} from "../constants/aiRecommendationConstant.js";
import { OPENAI_DEFAULTS } from "../constants/aiConstant.js";
import BadRequestError from "../errors/BadRequestError.js";
import aiRecommendationClient from "./aiRecommendationClient.js";
import aiRecommendationDataService from "./aiRecommendationDataService.js";

dotenv.config();

const getOpenAiConfig = () => ({
  apiKey: process.env.OPENAI_API_KEY?.trim(),
  url: process.env.OPENAI_API_URL || OPENAI_DEFAULTS.URL,
  model: process.env.OPENAI_MODEL || OPENAI_DEFAULTS.MODEL,
  temperature: Number(process.env.OPENAI_TEMPERATURE ?? 0.5),
  maxTokens: Number(process.env.OPENAI_MAX_TOKENS ?? 800),
});

const summarizeWithLlm = async ({ audience, jsonPayload }) => {
  const { apiKey, url, model, temperature, maxTokens } = getOpenAiConfig();
  if (!apiKey) {
    throw new BadRequestError(
      "Chưa cấu hình OPENAI_API_KEY để tạo câu trả lời tự nhiên.",
    );
  }

  const systemPrompt =
    audience === AI_RECOMMENDATION_AUDIENCE.ADMIN
      ? `Bạn là trợ lý phân tích vận hành cho Admin hệ thống đặt sân cầu lông B-Hub.
Nhiệm vụ: đọc dữ liệu JSON phân tích và viết một bản tóm tắt tiếng Việt ngắn gọn, chuyên nghiệp, dễ đọc.

Định dạng bắt buộc (markdown):
- Dùng "## " cho tiêu đề mỗi mục.
- Dùng gạch đầu dòng "- " cho từng ý, mỗi mục tối đa 3-4 dòng.
- Bôi đậm số liệu và tên cơ sở quan trọng bằng **...**.

Trình bày theo đúng 4 mục sau (đúng thứ tự):
## Tổng quan
## Khung giờ nên tạo khuyến mãi
## Khách hàng cần chăm sóc
## Hành động đề xuất

Quy tắc: tuyệt đối không bịa số liệu ngoài JSON, viết tự nhiên, đi thẳng vào trọng tâm, không lặp lại tiêu đề thừa.`
      : `Bạn là trợ lý gợi ý đặt sân B-Hub.
Đọc JSON gợi ý (chi nhánh, khung giờ, khuyến mãi) và trả lời tiếng Việt thân thiện, ngắn gọn.
Dùng bullet • cho danh sách. Thêm link markdown [Đặt sân](/branches/{branchId}) khi có branchId.
Không bịa dữ liệu ngoài JSON.`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Dữ liệu gợi ý JSON:\n${JSON.stringify(jsonPayload, null, 2)}`,
        },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new BadRequestError(
      data?.error?.message || "Không thể tạo câu trả lời tự nhiên từ LLM.",
    );
  }

  return data?.choices?.[0]?.message?.content?.trim() || "";
};

export const trainModelService = async () => {
  let productResult = null;
  try {
    const productPayload =
      await aiRecommendationDataService.buildProductTrainPayload();
    productResult = await aiRecommendationClient.trainProductModel(productPayload);
    productResult = {
      ...productResult,
      recordCount: productPayload.records.length,
      basketCount: productPayload.baskets.length,
    };
  } catch (err) {
    productResult = { trained: false, reason: err.message };
  }

  return {
    productResult,
  };
};

export const getProductRecommendationService = async ({
  mode = "user",
  userId = null,
  productId = null,
  topK = AI_RECOMMENDATION_DEFAULTS.TOP_K,
}) => {
  const payload = await aiRecommendationDataService.buildProductRecommendPayload({
    mode,
    userId,
    productId,
    topK,
  });
  const recommendations =
    await aiRecommendationClient.getProductRecommendations(payload);

  return {
    recommendations,
    meta: {
      mode,
      userId,
      productId,
      historyCount: payload.history.length,
    },
  };
};

export const getAdminRecommendationService = async ({
  lookbackDays,
  lowFillThreshold,
  churnDaysThreshold,
  naturalLanguage = false,
}) => {
  const payload = await aiRecommendationDataService.buildAdminInsightsPayload({
    lookbackDays,
    lowFillThreshold,
    churnDaysThreshold,
  });
  const insights = await aiRecommendationClient.getAdminInsights(payload);

  const result = {
    insights,
    meta: {
      lookbackDays:
        lookbackDays ?? AI_RECOMMENDATION_DEFAULTS.OCCUPANCY_LOOKBACK_DAYS,
      occupancyRowCount: payload.occupancy.length,
      userActivityCount: payload.userActivity.length,
    },
  };

  if (naturalLanguage) {
    result.naturalLanguageAnswer = await summarizeWithLlm({
      audience: AI_RECOMMENDATION_AUDIENCE.ADMIN,
      jsonPayload: insights,
    });
  }

  return result;
};

export const getAiServiceStatusService = async () => {
  const health = await aiRecommendationClient.checkAiServiceHealth();
  const cron = process.env.AI_TRAINING_CRON?.trim() || AI_TRAINING_JOB.DEFAULT_CRON;
  return {
    ...health,
    productModel: health?.productModel ?? { ready: false },
    trainingSchedule: {
      cron,
      timezone: AI_TRAINING_JOB.TIMEZONE,
    },
  };
};

export default {
  trainModelService,
  getAdminRecommendationService,
  getProductRecommendationService,
  getAiServiceStatusService,
};
