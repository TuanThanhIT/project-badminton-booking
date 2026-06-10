import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import purchaseReceiptService from "../../services/admin/purchaseReceiptService.js";

const getPurchaseReceiptsController = asyncHandler(async (req, res) => {
  const result = await purchaseReceiptService.getPurchaseReceiptsService(
    req.query,
  );

  return res.json(
    new SuccessResponse("Lấy danh sách phiếu nhập hàng thành công", result),
  );
});

const getPurchaseReceiptDetailController = asyncHandler(async (req, res) => {
  const result = await purchaseReceiptService.getPurchaseReceiptDetailService(
    req.params.receiptId,
  );

  return res.json(
    new SuccessResponse("Lấy chi tiết phiếu nhập hàng thành công", result),
  );
});

const approvePurchaseReceiptController = asyncHandler(async (req, res) => {
  const result = await purchaseReceiptService.approvePurchaseReceiptService(
    req.params.receiptId,
    req.user.id,
  );

  return res.json(
    new SuccessResponse("Duyệt phiếu nhập hàng thành công", result),
  );
});

const rejectPurchaseReceiptController = asyncHandler(async (req, res) => {
  const result = await purchaseReceiptService.rejectPurchaseReceiptService(
    req.params.receiptId,
    req.user.id,
    req.body,
  );

  return res.json(
    new SuccessResponse("Từ chối phiếu nhập hàng thành công", result),
  );
});

export default {
  getPurchaseReceiptsController,
  getPurchaseReceiptDetailController,
  approvePurchaseReceiptController,
  rejectPurchaseReceiptController,
};
