import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import purchaseReceiptService from "../../services/manager/purchaseReceiptService.js";

const getPurchaseReceiptsController = asyncHandler(async (req, res) => {
  const result = await purchaseReceiptService.getPurchaseReceiptsService(
    req.user.id,
    req.query,
  );
  return res.json(new SuccessResponse("Get purchase receipts successfully", result));
});

const createPurchaseReceiptController = asyncHandler(async (req, res) => {
  const result = await purchaseReceiptService.createPurchaseReceiptService(
    req.user.id,
    req.body,
  );
  return res.status(201).json(new SuccessResponse("Create purchase receipt successfully", result));
});

const getPurchaseReceiptDetailController = asyncHandler(async (req, res) => {
  const result = await purchaseReceiptService.getPurchaseReceiptDetailService(
    req.user.id,
    req.params.receiptId,
  );
  return res.json(new SuccessResponse("Get purchase receipt detail successfully", result));
});

const cancelPurchaseReceiptController = asyncHandler(async (req, res) => {
  const result = await purchaseReceiptService.cancelPurchaseReceiptService(
    req.user.id,
    req.params.receiptId,
  );
  return res.json(new SuccessResponse("Cancel purchase receipt successfully", result));
});

export default {
  getPurchaseReceiptsController,
  createPurchaseReceiptController,
  getPurchaseReceiptDetailController,
  cancelPurchaseReceiptController,
};
