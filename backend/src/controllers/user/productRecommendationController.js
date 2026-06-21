import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import aiRecommendationService from "../../services/aiRecommendationService.js";

export const getProductRecommendationsController = asyncHandler(
  async (req, res) => {
    const topK = Number(req.query.topK) || undefined;

    const result = await aiRecommendationService.getProductRecommendationService({
      mode: "user",
      userId: req.user?.id ?? null,
      topK,
    });

    return res
      .status(200)
      .json(new SuccessResponse("Lấy gợi ý sản phẩm thành công", result));
  },
);

export const getRelatedProductsController = asyncHandler(async (req, res) => {
  const productId = Number(req.query.productId);
  const topK = Number(req.query.topK) || undefined;

  const result = await aiRecommendationService.getProductRecommendationService({
    mode: "related",
    productId,
    topK,
  });

  return res
    .status(200)
    .json(new SuccessResponse("Lấy sản phẩm mua kèm thành công", result));
});

export default {
  getProductRecommendationsController,
  getRelatedProductsController,
};
