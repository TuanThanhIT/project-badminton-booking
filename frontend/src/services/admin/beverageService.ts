import instance from "../../utils/axiosCustomize";
import type {
  BeverageItem,
  CreateBeverageRequest,
  UpdateBeverageRequest,
  BeverageListRequest,
  BeverageListResponse,
  BeverageDetailResponse,
} from "../../types/beverage";

const createBeverageService = (data: CreateBeverageRequest) => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("price", String(data.price));
  formData.append("stock", String(data.stock));
  if (data.file) formData.append("file", data.file);

  return instance.post<BeverageItem>("/admin/beverage/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const updateBeverageService = (
  beverageId: number,
  data: UpdateBeverageRequest
) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value as any);
    }
  });

  return instance.put<{ message: string; beverage: BeverageItem }>(
    `/admin/beverage/update/${beverageId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};

const getBeverageByIdService = (beverageId: number) => {
  return instance.get<BeverageDetailResponse>(`/admin/beverage/${beverageId}`);
};

const getAllBeveragesService = (params: BeverageListRequest) => {
  return instance.get<BeverageListResponse>("/admin/beverage", {
    params,
  });
};
const beverageService = {
  createBeverageService,
  updateBeverageService,
  getBeverageByIdService,
  getAllBeveragesService,
};

export default beverageService;
