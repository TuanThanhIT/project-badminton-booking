import type { ApiResponse } from "./api";
import type { ManagerShiftRole } from "./workShift";

///MANAGER
export type ManagerSalaryAssignment = {
  assignmentId: number;
  workShiftId: number;
  roleInShift: ManagerShiftRole;
  checkIn: string | null;
  checkOut: string | null;
  completionRate: number;
  earnedWage: number;
  shiftWage: number;
  workShift: {
    id: number;
    shiftName: string;
    workDate: string;
    startTime: string;
    endTime: string;
    shiftStatus: string;
  };
};

///MANAGER
export type ManagerEmployeeSalary = {
  employeeId: number;
  username: string;
  email: string;
  fullName?: string | null;
  phoneNumber?: string | null;
  avatar?: string | null;
  shiftCount: number;
  completedShiftCount: number;
  totalEarnedWage: number;
  averageCompletionRate: number;
  assignments: ManagerSalaryAssignment[];
};

///MANAGER
export type ManagerMonthlySalaryData = {
  branchId: number;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  employeeCount: number;
  totalShiftCount: number;
  totalSalary: number;
  employees: ManagerEmployeeSalary[];
};

///MANAGER
export type ManagerSalaryQueries = {
  month?: number;
  year?: number;
};

///MANAGER
export type ManagerMonthlySalaryResponse =
  ApiResponse<ManagerMonthlySalaryData>;
