import purchaseReceiptService from "../shared/purchaseReceiptService.js";

const getPurchaseReceiptsService = (query) =>
  purchaseReceiptService.getReceiptsService({ query });

const getPurchaseReceiptDetailService = (receiptId) =>
  purchaseReceiptService.getReceiptDetailService({ receiptId });

const approvePurchaseReceiptService = (receiptId, adminId) =>
  purchaseReceiptService.approveReceiptService({ receiptId, adminId });

const rejectPurchaseReceiptService = (receiptId, adminId, data = {}) =>
  purchaseReceiptService.rejectReceiptService({
    receiptId,
    adminId,
    reason: data.reason,
  });

export default {
  getPurchaseReceiptsService,
  getPurchaseReceiptDetailService,
  approvePurchaseReceiptService,
  rejectPurchaseReceiptService,
};
