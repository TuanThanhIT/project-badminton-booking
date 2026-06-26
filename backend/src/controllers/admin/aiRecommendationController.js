import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import aiRecommendationService from "../../services/aiRecommendationService.js";

const parseBool = (value) =>
  value === true || value === "true" || value === "1";

export const getAdminInsightsController = asyncHandler(async (req, res) => {
  const naturalLanguage = parseBool(req.query.naturalLanguage);

  const result = await aiRecommendationService.getAdminRecommendationService({
    lookbackDays: req.query.lookbackDays
      ? Number(req.query.lookbackDays)
      : undefined,
    lowFillThreshold: req.query.lowFillThreshold
      ? Number(req.query.lowFillThreshold)
      : undefined,
    churnDaysThreshold: req.query.churnDaysThreshold
      ? Number(req.query.churnDaysThreshold)
      : undefined,
    naturalLanguage,
  });

  return res.status(200).json(
    new SuccessResponse("Lấy phân tích AI thành công", result),
  );
});

export const trainModelController = asyncHandler(async (req, res) => {
  const result = await aiRecommendationService.trainModelService();
  return res.status(200).json(
    new SuccessResponse("Huấn luyện mô hình AI thành công", result),
  );
});

export const getAiServiceStatusController = asyncHandler(async (req, res) => {
  const status = await aiRecommendationService.getAiServiceStatusService();
  return res.status(200).json(
    new SuccessResponse("Trạng thái AI Service", status),
  );
});

export default {
  getAdminInsightsController,
  trainModelController,
  getAiServiceStatusController,
};
