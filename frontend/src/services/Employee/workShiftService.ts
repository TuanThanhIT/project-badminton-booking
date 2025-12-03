import type {
  UpdateCheckIntRequest,
  UpdateCheckOutRequest,
  UpdateWorkShiftResponse,
  WorkShiftRequest,
  WorkShiftResponse,
} from "../../types/workShift";
import instance from "../../utils/axiosCustomize";

const getWorkShiftByDateService = (data: WorkShiftRequest) => {
  const { date } = data;
  return instance.get<WorkShiftResponse[]>(`/employee/work-shift/list/${date}`);
};

const updateCheckInAndCashRegisterService = (dt: UpdateCheckIntRequest) => {
  const { workShiftId, checkInTime, openCash } = dt;
  const data = { checkInTime, openCash };
  return instance.patch<UpdateWorkShiftResponse>(
    `/employee/work-shift/update/check-in/${workShiftId}`,
    data
  );
};

const updateCheckOutAndCashRegisterService = (dt: UpdateCheckOutRequest) => {
  const { workShiftId, checkOutTime, closeCash } = dt;
  const data = { checkOutTime, closeCash };
  return instance.patch<UpdateWorkShiftResponse>(
    `/employee/work-shift/update/check-out/${workShiftId}`,
    data
  );
};

const workShiftService = {
  getWorkShiftByDateService,
  updateCheckInAndCashRegisterService,
  updateCheckOutAndCashRegisterService,
};
export default workShiftService;
