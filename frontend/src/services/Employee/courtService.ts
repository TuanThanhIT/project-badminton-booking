import type {
  CourtScheduleEplRequest,
  CourtScheduleEplResponse,
} from "../../types/court";
import instance from "../../utils/axiosCustomize";

const getCourtSchedules = (data: CourtScheduleEplRequest) => {
  return instance.get<CourtScheduleEplResponse>(
    "/employee/court/schedule/list",
    { params: data }
  );
};
const courtService = {
  getCourtSchedules,
};
export default courtService;
