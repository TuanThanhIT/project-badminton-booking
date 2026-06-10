import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import inventoryService from "../../services/admin/inventoryService.js";

const getVariantStocksController = asyncHandler(async (req, res) => {
  const result = await inventoryService.getVariantStocksService(req.query);

  return res.json(
    new SuccessResponse(
      "Lấy danh sách tồn kho biến thể sản phẩm thành công",
      result,
    ),
  );
});

const getBeverageStocksController = asyncHandler(async (req, res) => {
  const result = await inventoryService.getBeverageStocksService(req.query);

  return res.json(
    new SuccessResponse("Lấy danh sách tồn kho đồ uống thành công", result),
  );
});

const getStockTransactionsController = asyncHandler(async (req, res) => {
  const result = await inventoryService.getStockTransactionsService(req.query);

  return res.json(
    new SuccessResponse("Lấy lịch sử giao dịch kho thành công", result),
  );
});

export default {
  getVariantStocksController,
  getBeverageStocksController,
  getStockTransactionsController,
};
