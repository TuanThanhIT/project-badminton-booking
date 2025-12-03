import { data } from "react-router-dom";
import type {
  UpdateWorkShiftRequest,
  UpdateWorkShiftResponse,
  WorkShiftRequest,
  WorkShiftResponse,
} from "../../types/workShift";
import instance from "../../utils/axiosCustomize";

const getWorkShiftByDateService = (data: WorkShiftRequest) => {
  const { date } = data;
  return instance.get<WorkShiftResponse[]>(`/employee/work-shift/list/${date}`);
};

const updateWorkShiftEmployeeAndCashRegisterService = (
  dt: UpdateWorkShiftRequest
) => {
  const { workShiftId, checkInTime, openCash } = dt;
  const data = { checkInTime, openCash };
  return instance.patch<UpdateWorkShiftResponse>(
    `/employee/work-shift/update/${workShiftId}`,
    data
  );
};
const workShiftService = {
  getWorkShiftByDateService,
  updateWorkShiftEmployeeAndCashRegisterService,
};
export default workShiftService;
