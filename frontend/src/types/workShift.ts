import type { ApiResponse } from "./api";

export type WorkShiftBranch = {
  id: number;
  branchName: string;
  address: string;
};

export type CashRegister = {
  id: number;
  openingCash: number;
  closingCash: number;
  expectedCash: number;
  difference: number | null;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeWorkShift = {
  assignmentId: number;
  workShiftId: number;
  employeeId: number;
  roleInShift: string;
  checkIn: string | null;
  checkOut: string | null;
  completionRate: number;
  earnedWage: number;
  cashRegister: CashRegister | null;
  workShift: {
    id: number;
    shiftName: string;
    workDate: string;
    startTime: string;
    endTime: string;
    cashierShiftWage: number;
    staffShiftWage: number;
    shiftStatus: string;
    branch: WorkShiftBranch | null;
  };
};

export type ShiftAssignment = {
  assignmentId: number;
  workShiftId: number;
  employeeId: number;
  roleInShift: "CASHIER" | "STAFF" | string;
  checkIn: string | null;
  checkOut: string | null;
  completionRate: number;
  earnedWage: number;
  employee: {
    id: number;
    username: string;
    email: string;
  } | null;
  workShift: EmployeeWorkShift["workShift"] | null;
};

///MANAGER
export type ManagerShiftRole = "CASHIER" | "STAFF";

///MANAGER
export type ManagerShiftAssignment = {
  assignmentId: number;
  workShiftId: number;
  employeeId: number;
  roleInShift: ManagerShiftRole;
  checkIn: string | null;
  checkOut: string | null;
  completionRate: number;
  earnedWage: number;
  employee: {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
    fullName?: string | null;
    phoneNumber?: string | null;
    avatar?: string | null;
  } | null;
};

///MANAGER
export type ManagerWorkShift = {
  id: number;
  shiftName: string;
  workDate: string;
  startTime: string;
  endTime: string;
  cashierShiftWage: number;
  staffShiftWage: number;
  branchId: number;
  shiftStatus: string;
  assignments: ManagerShiftAssignment[];
  createdAt: string;
  updatedAt: string;
};

///MANAGER
export type ManagerWorkShiftListData = {
  branchId: number;
  workShifts: ManagerWorkShift[];
};

///MANAGER
export type ManagerWorkShiftQueries = {
  workDate?: string;
};

///MANAGER
export type CreateManagerWorkShiftRequest = {
  shiftName: string;
  workDate: string;
  startTime: string;
  endTime: string;
  cashierShiftWage: number;
  staffShiftWage: number;
};

///MANAGER
export type AssignManagerShiftRequest = {
  workShiftId: number;
  employeeId: number;
  roleInShift: ManagerShiftRole;
};

///MANAGER
export type UpdateManagerShiftAssignmentRequest = {
  assignmentId: number;
  roleInShift: ManagerShiftRole;
};

///MANAGER
export type RemoveManagerShiftAssignmentData = {
  assignmentId: number;
  workShiftId: number;
};

export type WorkShiftByDateRequest = {
  date: string;
};

export type CurrentWorkShiftRequest = {
  date: string;
  time: string;
};

export type CheckInRequest = {
  workShiftId: number;
  checkInTime: string;
  openingCash: number;
};

export type CheckOutRequest = {
  workShiftId: number;
  checkOutTime: string;
  closingCash: number;
};

export type ShiftAssignmentsRequest = {
  workShiftId: number;
};

export type UpdateShiftAssignmentRequest = {
  workShiftId: number;
  assignmentId: number;
  checkInTime?: string;
  checkOutTime?: string;
};

export type WorkShiftListResponse = ApiResponse<EmployeeWorkShift[]>;
export type CurrentWorkShiftResponse = ApiResponse<EmployeeWorkShift | null>;
export type CheckInResponse = ApiResponse<EmployeeWorkShift>;
export type CheckOutResponse = ApiResponse<EmployeeWorkShift>;
export type ShiftAssignmentsResponse = ApiResponse<ShiftAssignment[]>;
export type UpdateShiftAssignmentResponse = ApiResponse<ShiftAssignment>;

///MANAGER
export type ManagerWorkShiftListResponse =
  ApiResponse<ManagerWorkShiftListData>;
export type ManagerWorkShiftResponse = ApiResponse<ManagerWorkShift>;
export type ManagerShiftAssignmentResponse = ApiResponse<ManagerShiftAssignment>;
export type RemoveManagerShiftAssignmentResponse =
  ApiResponse<RemoveManagerShiftAssignmentData>;
