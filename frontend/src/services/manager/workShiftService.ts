import instance from "../../utils/axiosCustomize";
import type {
  AssignManagerShiftRequest,
  CreateManagerWorkShiftRequest,
  ManagerShiftAssignmentResponse,
  ManagerWorkShiftListResponse,
  ManagerWorkShiftQueries,
  ManagerWorkShiftResponse,
  RemoveManagerShiftAssignmentResponse,
  UpdateManagerShiftAssignmentRequest,
} from "../../types/workShift";

///MANAGER
const getWorkShiftsService = (params: ManagerWorkShiftQueries) =>
  instance.get<ManagerWorkShiftListResponse>("/manager/work-shifts", {
    params,
  });

///MANAGER
const createWorkShiftService = (data: CreateManagerWorkShiftRequest) =>
  instance.post<ManagerWorkShiftResponse>("/manager/work-shifts", data);

///MANAGER
const assignEmployeeService = (data: AssignManagerShiftRequest) =>
  instance.post<ManagerShiftAssignmentResponse>(
    "/manager/work-shifts/assignments",
    data,
  );

///MANAGER
const updateAssignmentService = ({
  assignmentId,
  roleInShift,
}: UpdateManagerShiftAssignmentRequest) =>
  instance.patch<ManagerShiftAssignmentResponse>(
    `/manager/work-shifts/assignments/${assignmentId}`,
    { roleInShift },
  );

///MANAGER
const removeAssignmentService = (assignmentId: number) =>
  instance.delete<RemoveManagerShiftAssignmentResponse>(
    `/manager/work-shifts/assignments/${assignmentId}`,
  );

///MANAGER
const managerWorkShiftService = {
  getWorkShiftsService,
  createWorkShiftService,
  assignEmployeeService,
  updateAssignmentService,
  removeAssignmentService,
};

export default managerWorkShiftService;
