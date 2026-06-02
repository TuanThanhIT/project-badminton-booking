import { getManagerBranchId } from "../shared/managerBranchService.js";
import purchaseReceiptService from "../shared/purchaseReceiptService.js";

const getPurchaseReceiptsService = async (managerId, query) => {
  const branchId = await getManagerBranchId(managerId);
  return purchaseReceiptService.getReceiptsService({
    where: { branchId },
    query,
  });
};

const createPurchaseReceiptService = async (managerId, data) => {
  const branchId = await getManagerBranchId(managerId);
  return purchaseReceiptService.createReceiptService({
    branchId,
    supplierId: data.supplierId,
    createdBy: managerId,
    data,
  });
};

const getPurchaseReceiptDetailService = async (managerId, receiptId) => {
  const branchId = await getManagerBranchId(managerId);
  return purchaseReceiptService.getReceiptDetailService({ receiptId, branchId });
};

const cancelPurchaseReceiptService = async (managerId, receiptId) => {
  const branchId = await getManagerBranchId(managerId);
  return purchaseReceiptService.cancelReceiptService({
    receiptId,
    managerId,
    branchId,
  });
};

export default {
  getPurchaseReceiptsService,
  createPurchaseReceiptService,
  getPurchaseReceiptDetailService,
  cancelPurchaseReceiptService,
};
