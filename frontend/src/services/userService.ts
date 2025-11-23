import { data } from "react-router-dom";
import {
  type CheckoutInfoResponse,
  type ProfileRequest,
  type ProfileResponse,
  type UpdateUserInfoRequest,
} from "../types/user";
import instance from "../utils/axiosCustomize";

const getProfileService = async () =>
  instance.get<ProfileResponse>("/user/profile");

const getCheckoutInfoService = async () =>
  instance.get<CheckoutInfoResponse>("/user/profile");

const updateProfileService = async (data: ProfileRequest) => {
  const formData = new FormData();

  if (data.fullName) formData.append("fullName", data.fullName);
  if (data.dob) formData.append("dob", data.dob);
  if (data.gender) formData.append("gender", data.gender);
  if (data.address) formData.append("address", data.address);
  if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
  if (data.file) formData.append("file", data.file);

  return instance.put<ProfileResponse>("/user/profile/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const updateUserInfoService = async (data: UpdateUserInfoRequest) =>
  instance.put("/user/profile/update/checkout", data);

const userService = {
  getProfileService,
  updateProfileService,
  getCheckoutInfoService,
  updateUserInfoService,
};
export default userService;
