import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import inventoryService from "../../services/admin/inventoryService.js";

const getVariantStocksController = asyncHandler(async (req, res) => {
  const result = await inventoryService.getVariantStocksService(req.query);
  return res.json(new SuccessResponse("Get variant stocks successfully", result));
});

const getBeverageStocksController = asyncHandler(async (req, res) => {
  const result = await inventoryService.getBeverageStocksService(req.query);
  return res.json(new SuccessResponse("Get beverage stocks successfully", result));
});

const getStockTransactionsController = asyncHandler(async (req, res) => {
  const result = await inventoryService.getStockTransactionsService(req.query);
  return res.json(new SuccessResponse("Get stock transactions successfully", result));
});

export default {
  getVariantStocksController,
  getBeverageStocksController,
  getStockTransactionsController,
};
