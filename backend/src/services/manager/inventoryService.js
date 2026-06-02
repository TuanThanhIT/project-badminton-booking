import { getManagerBranchId } from "../shared/managerBranchService.js";
import inventoryQueryService from "../shared/inventoryQueryService.js";

const getVariantStocksService = async (managerId, query) => {
  const branchId = await getManagerBranchId(managerId);
  return inventoryQueryService.getVariantStocksService({ branchId, query });
};

const getBeverageStocksService = async (managerId, query) => {
  const branchId = await getManagerBranchId(managerId);
  return inventoryQueryService.getBeverageStocksService({ branchId, query });
};

const getStockTransactionsService = async (managerId, query) => {
  const branchId = await getManagerBranchId(managerId);
  return inventoryQueryService.getStockTransactionsService({ branchId, query });
};

const getVariantStockHistoryService = async (managerId, variantId, query) => {
  const branchId = await getManagerBranchId(managerId);
  return inventoryQueryService.getVariantStockHistoryService({
    branchId,
    variantId,
    query,
  });
};

const getBeverageStockHistoryService = async (managerId, beverageId, query) => {
  const branchId = await getManagerBranchId(managerId);
  return inventoryQueryService.getBeverageStockHistoryService({
    branchId,
    beverageId,
    query,
  });
};

export default {
  getVariantStocksService,
  getBeverageStocksService,
  getStockTransactionsService,
  getVariantStockHistoryService,
  getBeverageStockHistoryService,
};
