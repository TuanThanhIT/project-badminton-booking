import type {
  InventoryReceiptListResponse,
  InventoryReceiptQueries,
} from "../../types/inventoryReceipt";
import instance from "../../utils/axiosCustomize";

const getInventoryReceiptsService = (params?: InventoryReceiptQueries) =>
  instance.get<InventoryReceiptListResponse>("/manager/inventory-receipts", {
    params,
  });

const inventoryReceiptService = {
  getInventoryReceiptsService,
};

export default inventoryReceiptService;
