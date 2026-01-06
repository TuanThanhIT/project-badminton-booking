export type User = {
  id: number;
  username: string;
  email: string;
  Profile: Profile;
};

export type CreateWorkShiftEmployeeInput = {
  workShiftId: number;
  employeeId: number;
  roleInShift: "Cashier" | "Staff";
};
export type Profile = {
  fullName: string;
  phoneNumber: string;
  avatar: string;
};

export type Employee = {
  id: number;
  username: string;
  email: string;
  Profile: Profile | null;
};

export type WorkShiftEmployee = {
  id: number;
  workShiftId: number;
  employeeId: number;
  roleInShift: "Cashier" | "Staff";
  checkIn?: string | null;
  checkOut?: string | null;
  earnedWage: number;
  employee: Employee;
};

export type MonthlySalaryResponse = {
  month: number;
  year: number;
  totalEmployees: number;
  totalPayroll: number;
  employees: {
    employeeId: number;
    username: string;
    email: string;
    fullName: string;
    totalShifts: number;
    totalWage: number;
  }[];
};

export type MonthlySalaryRequest = {
  month: number;
  year: number;
};

export type WorkShiftDetailResponse = {
  id: number;
  checkIn: string;
  checkOut: string;
  workShift: {
    name: string;
    workDate: string;
    startTime: string;
    endTime: string;
  };
}[];

export type WorkShiftDetailRequest = {
  employeeId: number;
};
