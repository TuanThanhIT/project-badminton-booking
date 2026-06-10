import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import inventoryService from "../../services/manager/inventoryService.js";

const getVariantStocksController = asyncHandler(async (req, res) => {
  const result = await inventoryService.getVariantStocksService(
    req.user.id,
    req.query,
  );
  return res.status(200).json(new SuccessResponse("Lấy danh sách tồn kho sản phẩm thành công", result));
});

const getBeverageStocksController = asyncHandler(async (req, res) => {
  const result = await inventoryService.getBeverageStocksService(
    req.user.id,
    req.query,
  );
  return res.status(200).json(new SuccessResponse("Lấy danh sách tồn kho đồ uống thành công", result));
});

const getStockTransactionsController = asyncHandler(async (req, res) => {
  const result = await inventoryService.getStockTransactionsService(
    req.user.id,
    req.query,
  );
  return res.status(200).json(new SuccessResponse("Lấy lịch sử giao dịch kho thành công", result));
});

const getVariantStockHistoryController = asyncHandler(async (req, res) => {
  const result = await inventoryService.getVariantStockHistoryService(
    req.user.id,
    req.params.variantId,
    req.query,
  );
  return res.status(200).json(new SuccessResponse("Lấy lịch sử tồn kho sản phẩm thành công", result));
});

const getBeverageStockHistoryController = asyncHandler(async (req, res) => {
  const result = await inventoryService.getBeverageStockHistoryService(
    req.user.id,
    req.params.beverageId,
    req.query,
  );
  return res.status(200).json(new SuccessResponse("Lấy lịch sử tồn kho đồ uống thành công", result));
});

export default {
  getVariantStocksController,
  getBeverageStocksController,
  getStockTransactionsController,
  getVariantStockHistoryController,
  getBeverageStockHistoryController,
};
