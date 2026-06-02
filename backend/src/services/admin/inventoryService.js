import inventoryQueryService from "../shared/inventoryQueryService.js";

const getVariantStocksService = (query) =>
  inventoryQueryService.getVariantStocksService({ query });

const getBeverageStocksService = (query) =>
  inventoryQueryService.getBeverageStocksService({ query });

const getStockTransactionsService = (query) =>
  inventoryQueryService.getStockTransactionsService({ query });

export default {
  getVariantStocksService,
  getBeverageStocksService,
  getStockTransactionsService,
};
