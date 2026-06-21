import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import aiRecommendationService from "../../services/aiRecommendationService.js";

const parseBool = (value) =>
  value === true || value === "true" || value === "1";

export const getUserRecommendationsController = asyncHandler(async (req, res) => {
  const topK = Number(req.query.topK) || undefined;
  const naturalLanguage = parseBool(req.query.naturalLanguage);

  const result = await aiRecommendationService.getUserRecommendationService({
    userId: req.user.id,
    topK,
    naturalLanguage,
  });

  return res.status(200).json(
    new SuccessResponse("Lấy gợi ý đặt sân thành công", result),
  );
});

export const getPublicRecommendationsController = asyncHandler(async (req, res) => {
  const topK = Number(req.query.topK) || undefined;
  const naturalLanguage = parseBool(req.query.naturalLanguage);

  const result = await aiRecommendationService.getUserRecommendationService({
    userId: null,
    topK,
    naturalLanguage,
  });

  return res.status(200).json(
    new SuccessResponse("Lấy gợi ý sân phổ biến thành công", result),
  );
});

export default {
  getUserRecommendationsController,
  getPublicRecommendationsController,
};
