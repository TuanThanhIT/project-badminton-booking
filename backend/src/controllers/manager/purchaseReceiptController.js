import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import purchaseReceiptService from "../../services/manager/purchaseReceiptService.js";

const getPurchaseReceiptsController = asyncHandler(async (req, res) => {
  const result = await purchaseReceiptService.getPurchaseReceiptsService(
    req.user.id,
    req.query,
  );
  return res.status(200).json(new SuccessResponse("Lấy danh sách phiếu nhập thành công", result));
});

const createPurchaseReceiptController = asyncHandler(async (req, res) => {
  const result = await purchaseReceiptService.createPurchaseReceiptService(
    req.user.id,
    req.body,
  );
  return res.status(201).json(new SuccessResponse("Tạo phiếu nhập thành công", result));
});

const getPurchaseReceiptDetailController = asyncHandler(async (req, res) => {
  const result = await purchaseReceiptService.getPurchaseReceiptDetailService(
    req.user.id,
    req.params.receiptId,
  );
  return res.status(200).json(new SuccessResponse("Lấy chi tiết phiếu nhập thành công", result));
});

const cancelPurchaseReceiptController = asyncHandler(async (req, res) => {
  const result = await purchaseReceiptService.cancelPurchaseReceiptService(
    req.user.id,
    req.params.receiptId,
  );
  return res.status(200).json(new SuccessResponse("Hủy phiếu nhập thành công", result));
});

export default {
  getPurchaseReceiptsController,
  createPurchaseReceiptController,
  getPurchaseReceiptDetailController,
  cancelPurchaseReceiptController,
};
