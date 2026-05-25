import instance from "../../utils/axiosCustomize";
import type {
  CheckInRequest,
  CheckInResponse,
  CheckOutRequest,
  CheckOutResponse,
  CurrentWorkShiftRequest,
  CurrentWorkShiftResponse,
  ShiftAssignmentsRequest,
  ShiftAssignmentsResponse,
  UpdateShiftAssignmentRequest,
  UpdateShiftAssignmentResponse,
  WorkShiftByDateRequest,
  WorkShiftListResponse,
} from "../../types/workShift";

const getWorkShiftsService = (data: WorkShiftByDateRequest) =>
  instance.get<WorkShiftListResponse>("/employee/work-shifts", {
    params: data,
  });

const getCurrentWorkShiftService = (data: CurrentWorkShiftRequest) =>
  instance.get<CurrentWorkShiftResponse>("/employee/work-shifts/current", {
    params: data,
  });

const updateCheckInService = ({
  workShiftId,
  checkInTime,
  openingCash,
}: CheckInRequest) =>
  instance.patch<CheckInResponse>(`/employee/work-shifts/${workShiftId}/check-in`, {
    checkInTime,
    openingCash,
  });

const updateCheckOutService = ({
  workShiftId,
  checkOutTime,
  closingCash,
}: CheckOutRequest) =>
  instance.patch<CheckOutResponse>(
    `/employee/work-shifts/${workShiftId}/check-out`,
    {
      checkOutTime,
      closingCash,
    },
  );

const getShiftAssignmentsService = ({ workShiftId }: ShiftAssignmentsRequest) =>
  instance.get<ShiftAssignmentsResponse>(
    `/employee/work-shifts/${workShiftId}/assignments`,
  );

const updateShiftAssignmentService = ({
  workShiftId,
  assignmentId,
  checkInTime,
  checkOutTime,
}: UpdateShiftAssignmentRequest) =>
  instance.patch<UpdateShiftAssignmentResponse>(
    `/employee/work-shifts/${workShiftId}/assignments/${assignmentId}`,
    {
      checkInTime,
      checkOutTime,
    },
  );

const workShiftService = {
  getWorkShiftsService,
  getCurrentWorkShiftService,
  updateCheckInService,
  updateCheckOutService,
  getShiftAssignmentsService,
  updateShiftAssignmentService,
};

export default workShiftService;
