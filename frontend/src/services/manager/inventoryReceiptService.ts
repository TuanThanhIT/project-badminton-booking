import type {
  InventoryReceiptListResponse,
  InventoryReceiptQueries,
} from "../../types/inventoryReceipt";
import instance from "../../utils/axiosCustomize";

const getInventoryReceiptsService = (params?: InventoryReceiptQueries) =>
  instance.get<InventoryReceiptListResponse>("/manager/inventory-receipts", {
    params,
  });

const exportInventoryReceiptsService = (date: string) =>
  instance.get<Blob>("/manager/inventory-receipts/export", {
    params: { date },
    responseType: "blob",
  });

const inventoryReceiptService = {
  getInventoryReceiptsService,
  exportInventoryReceiptsService,
};

export default inventoryReceiptService;
