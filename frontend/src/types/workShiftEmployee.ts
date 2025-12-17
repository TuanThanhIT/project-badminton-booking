// export type Profile = {
//   fullName: string;
//   phoneNumber: string;
//   avatar: string;
// };

export type User = {
  id: number;
  username: string;
  email: string;
  Profile: Profile;
};

// export type WorkShiftEmployee = {
//   id: number;
//   workShiftId: number;
//   employeeId: number;
//   roleInShift: "Cashier" | "Staff";
//   checkIn?: string | null;
//   checkOut?: string | null;
//   earnedWage: number;
//   User: User;
// };

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
