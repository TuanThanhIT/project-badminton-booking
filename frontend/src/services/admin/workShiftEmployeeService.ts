import instance from "../../utils/axiosCustomize";
import type {
  WorkShiftEmployee,
  CreateWorkShiftEmployeeInput,
  MonthlySalaryRequest,
  MonthlySalaryResponse,
  WorkShiftDetailRequest,
  WorkShiftDetailResponse,
} from "../../types/workShiftEmployee";

// Phân nhân viên vào ca
const assignEmployeeService = (data: CreateWorkShiftEmployeeInput) => {
  return instance.post("/admin/work-shift-employee/assign", data);
};

// Lấy nhân viên theo ca
const getEmployeesByShiftService = (workShiftId: number) => {
  return instance.get<{
    shift: any;
    employees: WorkShiftEmployee[];
  }>(`/admin/work-shift-employee/shift/${workShiftId}`);
};

// Update nhân viên trong ca
const updateEmployeeInShiftService = (
  id: number,
  data: Partial<WorkShiftEmployee>
) => {
  return instance.put(`/admin/work-shift-employee/update/${id}`, data);
};

// Xóa nhân viên khỏi ca
const removeEmployeeFromShiftService = (id: number) => {
  return instance.delete(`/admin/work-shift-employee/remove/${id}`);
};

const getAllEmployeesMonthlySalaryService = (data: MonthlySalaryRequest) => {
  return instance.get<MonthlySalaryResponse>(
    "/admin/work-shift-employee/all/monthly-salary",
    {
      params: data,
    }
  );
};

const getWorkShiftEmployeeDetailService = (data: WorkShiftDetailRequest) => {
  const employeeId = data.employeeId;
  return instance.get<WorkShiftDetailResponse>(
    `/admin/work-shift-employee/detail/${employeeId}`
  );
};

const workShiftEmployeeService = {
  assignEmployeeService,
  getEmployeesByShiftService,
  updateEmployeeInShiftService,
  removeEmployeeFromShiftService,
  getAllEmployeesMonthlySalaryService,
  getWorkShiftEmployeeDetailService,
};

export default workShiftEmployeeService;
