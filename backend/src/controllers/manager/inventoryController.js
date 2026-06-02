import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import inventoryService from "../../services/manager/inventoryService.js";

const getVariantStocksController = asyncHandler(async (req, res) => {
  const result = await inventoryService.getVariantStocksService(
    req.user.id,
    req.query,
  );
  return res.json(new SuccessResponse("Get variant stocks successfully", result));
});

const getBeverageStocksController = asyncHandler(async (req, res) => {
  const result = await inventoryService.getBeverageStocksService(
    req.user.id,
    req.query,
  );
  return res.json(new SuccessResponse("Get beverage stocks successfully", result));
});

const getStockTransactionsController = asyncHandler(async (req, res) => {
  const result = await inventoryService.getStockTransactionsService(
    req.user.id,
    req.query,
  );
  return res.json(new SuccessResponse("Get stock transactions successfully", result));
});

const getVariantStockHistoryController = asyncHandler(async (req, res) => {
  const result = await inventoryService.getVariantStockHistoryService(
    req.user.id,
    req.params.variantId,
    req.query,
  );
  return res.json(new SuccessResponse("Get variant stock history successfully", result));
});

const getBeverageStockHistoryController = asyncHandler(async (req, res) => {
  const result = await inventoryService.getBeverageStockHistoryService(
    req.user.id,
    req.params.beverageId,
    req.query,
  );
  return res.json(new SuccessResponse("Get beverage stock history successfully", result));
});

export default {
  getVariantStocksController,
  getBeverageStocksController,
  getStockTransactionsController,
  getVariantStockHistoryController,
  getBeverageStockHistoryController,
};
