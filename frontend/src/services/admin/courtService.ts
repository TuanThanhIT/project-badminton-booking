import instance from "../../utils/axiosCustomize";
import type {
  CourtItem,
  CreateCourtRequest,
  CourtPriceItem,
  CreateCourtPriceRequest,
  CreateWeeklySlotsRequest,
} from "../../types/court";

// ===================================================
// 1. TẠO SÂN — POST /admin/court/add
// (multipart/form-data)
// ===================================================
const createCourtService = (data: CreateCourtRequest) => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("location", data.location);
  if (data.file) formData.append("file", data.file);

  return instance.post<CourtItem>("/admin/court/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ===================================================
// 2. CẬP NHẬT SÂN — PUT /admin/court/update/:courtId
// ===================================================
const updateCourtService = (courtId: number, data: Partial<CourtItem>) => {
  return instance.put(`/admin/court/update/${courtId}`, data);
};

// ===================================================
// 3. LẤY TẤT CẢ SÂN — GET /admin/court/
// ===================================================
const getAllCourtsService = () => {
  return instance.get<{ message: string; courts: CourtItem[] }>(
    "/admin/court/"
  );
};

// ===================================================
// 4. LẤY 1 SÂN — GET /admin/court/:courtId
// ===================================================
const getCourtByIdService = (courtId: number) => {
  return instance.get<{ message: string; court: CourtItem }>(
    `/admin/court/${courtId}`
  );
};

// ===================================================
// 5. TẠO GIÁ SÂN — POST /admin/court/price/add
// ===================================================
const createCourtPriceService = (data: CreateCourtPriceRequest) => {
  return instance.post<CourtPriceItem>("/admin/court/price/add", data);
};

// ===================================================
// 6. TẠO SLOT 7 NGÀY — POST /admin/court/create-weekly-slots
// ===================================================
const createWeeklySlotsService = (data: CreateWeeklySlotsRequest) => {
  return instance.post("/admin/court/create-weekly-slots", data);
};

// ===================================================
// EXPORT
// ===================================================
const courtService = {
  createCourtService,
  updateCourtService,
  getAllCourtsService,
  getCourtByIdService,
  createCourtPriceService,
  createWeeklySlotsService,
};

export default courtService;
