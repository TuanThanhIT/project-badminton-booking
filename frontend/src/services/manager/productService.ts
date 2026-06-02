import instance from "../../utils/axiosCustomize";

import type {
  ManagerProductDetailResponse,
  ManagerProductCategoriesResponse,
  ManagerProductQueries,
  ManagerProductStockUpdateRequest,
  ManagerProductStockUpdateResponse,
  ManagerProductsResponse,
} from "../../types/product";

///MANAGER
const getProductsService = (params: ManagerProductQueries) =>
  instance.get<ManagerProductsResponse>("/manager/products/inventory", {
    params,
  });

///MANAGER
const getProductCategoriesService = () =>
  instance.get<ManagerProductCategoriesResponse>("/manager/product-categories");

///MANAGER
const getProductDetailService = (productId: number) =>
  instance.get<ManagerProductDetailResponse>(`/manager/products/${productId}`);

///MANAGER
const updateProductStockService = ({
  variantId,
  stock,
}: ManagerProductStockUpdateRequest) =>
  instance.patch<ManagerProductStockUpdateResponse>(
    `/manager/products/variants/${variantId}/stock`,
    { stock },
  );

///MANAGER
const managerProductService = {
  getProductsService,
  getProductCategoriesService,
  getProductDetailService,
  updateProductStockService,
};

export default managerProductService;
