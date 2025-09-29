import type { ProfileRequest, ProfileResponse } from "../types/user";
import instance from "../utils/axiosCustomize";

const getProfileService = async () =>
  instance.get<ProfileResponse>("/user/profile");

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

const userService = {
  getProfileService,
  updateProfileService,
};
export default userService;
