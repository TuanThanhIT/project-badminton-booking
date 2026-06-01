import instance from "../../utils/axiosCustomize";

import type {
  CourtImageUploadResponse,
  CreateCourtPriceRequest,
  CreateCourtRequest,
} from "../../types/court";

const createCourtService = (data: CreateCourtRequest) => {
  return instance.post("/manager/courts", data);
};

const createCourtPriceService = (data: CreateCourtPriceRequest) =>
  instance.post("/manager/courts/prices", data);

const getCourtsService = () => {
  return instance.get("/manager/courts");
};

const getCourtPricesService = () => {
  return instance.get("/manager/courts/prices");
};

const updateCourtService = (courtId: number, data: CreateCourtRequest) => {
  return instance.put(`/manager/courts/${courtId}`, data);
};

const uploadCourtImageService = (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  return instance.post<CourtImageUploadResponse>(
    "/manager/courts/upload-image",
    formData,
  );
};

const maintenanceCourtService = (courtId: number) => {
  return instance.patch(`/manager/courts/${courtId}/maintenance`);
};

const closeCourtService = (courtId: number) => {
  return instance.patch(`/manager/courts/${courtId}/close`);
};

const managerCourtService = {
  createCourtService,
  createCourtPriceService,
  getCourtsService,
  getCourtPricesService,
  updateCourtService,
  uploadCourtImageService,
  maintenanceCourtService,
  closeCourtService,
};

export default managerCourtService;
