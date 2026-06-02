import instance from "../../utils/axiosCustomize";

import type {
  ManagerBeverageQueries,
  ManagerBeverageStockUpdateRequest,
  ManagerBeverageStockUpdateResponse,
  ManagerBeveragesResponse,
} from "../../types/beverage";

///MANAGER
const getBeveragesService = (params: ManagerBeverageQueries) =>
  instance.get<ManagerBeveragesResponse>("/manager/beverages/inventory", {
    params,
  });

///MANAGER
const updateBeverageStockService = ({
  beverageId,
  stock,
}: ManagerBeverageStockUpdateRequest) =>
  instance.patch<ManagerBeverageStockUpdateResponse>(
    `/manager/beverages/${beverageId}/stock`,
    { stock },
  );

///MANAGER
const managerBeverageService = {
  getBeveragesService,
  updateBeverageStockService,
};

export default managerBeverageService;
