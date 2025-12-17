import instance from "../../utils/axiosCustomize";
import type {
  CreateWorkShiftRequest,
  WorkShiftListResponse,
} from "../../types/workShift";

const createWorkShiftService = (data: CreateWorkShiftRequest) => {
  return instance.post("/admin/workshift/add", data);
};

const getAllWorkShiftsService = (params: {
  page?: number;
  limit?: number;
  workDate?: string;
}) => {
  return instance.get<WorkShiftListResponse>("/admin/workshift", {
    params,
  });
};

const workShiftService = {
  createWorkShiftService,
  getAllWorkShiftsService,
};

export default workShiftService;
