import type { ApiResponse } from "./api";

export type EmployeeGender = "male" | "female" | "other";

export type ManagerEmployee = {
  branchId: number;
  employeeId: number;
  username: string;
  email: string;
  isActive: boolean;
  createdDate: string;
  fullName?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  gender?: EmployeeGender | null;
  avatar?: string | null;
  level?: string | null;
};

export type CreateEmployeeRequest = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  gender: EmployeeGender;
};

export type CreateEmployeeData = {
  branchId: number;
  employee: {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
    createdDate: string;
  };
  profile: {
    fullName?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    gender?: EmployeeGender | null;
    avatar?: string | null;
    level?: string | null;
  };
};

export type ManagerEmployeesResponse = ApiResponse<ManagerEmployee[]>;
export type CreateEmployeeResponse = ApiResponse<CreateEmployeeData>;
