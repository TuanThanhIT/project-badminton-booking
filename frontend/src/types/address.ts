import type { ApiResponse } from "./api";

export type Address = {
  id: number;
  label: string;
  fullName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
};

export type UserAddress = {
  hasDefault: boolean;
  addresses: Address[];
};

export type UserAddressResponse = ApiResponse<UserAddress>;

export type AddUserAddressResponse = ApiResponse<Address>;

export type UpdateUserAddressResponse = ApiResponse<Address>;

export type DeleteUserAddressResponse = ApiResponse<null>;

export type AddUserAddressRequest = {
  label: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
};

export type UpdateUserAddressRequest = {
  label?: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  addressId: number;
};

export type DeleteUserAddressRequest = {
  addressId: number;
};

export type Province = { code: number; name: string };
export type District = { code: number; name: string };
export type Ward = { code: number; name: string };

export type FullAddress = {
  address: string;
  provinceCode: number;
  districtCode: number;
  wardCode: number;
};
