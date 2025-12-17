export type ProfileResponse = {
  id: number;
  fullName: string;
  dob: string;
  gender: string;
  address: string;
  phoneNumber: string;
  avatar: string;
  createdDate: string;
  updatedDate: string;
};

export type ProfileRequest = {
  fullName?: string;
  dob?: string;
  gender?: string;
  address?: string;
  phoneNumber?: string;
  file?: File;
};

export type UpdateUserInfoRequest = {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
};

export type CheckoutInfoResponse = {
  fullName: string;
  address: string;
  phoneNumber: string;
};
//admin
export type UserResponse = {
  id: number;
  fullName: string;
  email: string;
  roleId: number;
  isActive: boolean;
  createdDate: string;
};
export type CreatedUser = {
  id: number;
  fullName: string;
  email: string;
  roleId: number;
  isActive: boolean;
  createdDate: string;
};
export type UserItem = {
  id: number;
  username: string;
  email: string;
  isVerified: boolean;
  isActive: boolean;
  roleId: number;
  createdDate: string;
  updatedDate: string;
  Role?: {
    id: number;
    roleName: string;
  };
};
export type CreateUserRequest = {
  username: string;
  password: string;
  email: string;
};
export type EmployeeProfile = {
  fullName: string;
} | null;

export type EmployeeItem = {
  id: number;
  username: string;
  Profile: EmployeeProfile;
};

export type GetEmployeesResponse = {
  data: EmployeeItem[];
};
