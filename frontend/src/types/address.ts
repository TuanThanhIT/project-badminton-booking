import type { ApiResponse } from "./api";

export type Address = {
  id: number;
  label: string;
  fullName: string;
  phoneNumber: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  address: string;
  provinceId: number;
  districtId: number;
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
  provinceName: string;
  districtName: string;
  wardName: string;
  provinceId: string;
  districtId: string;
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
  provinceName?: string;
  districtName?: string;
  wardName?: string;
  provinceId?: string;
  districtId?: string;
  wardCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  addressId: number;
};

export type DeleteUserAddressRequest = {
  addressId: number;
};

export type Province = { ProvinceID: number; ProvinceName: string };

export type District = {
  DistrictID: number;
  DistrictName: string;
};

export type Ward = {
  WardCode: string;
  WardName: string;
};

export type FullAddress = {
  address: string;
  provinceCode: number;
  districtCode: number;
  wardCode: number;
};
