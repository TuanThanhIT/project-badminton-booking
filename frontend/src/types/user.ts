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
