import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import userService from "../../services/customer/userService.js";
import uploadBuffer from "../../utils/cloudinary.js";

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = { userId };
  const profile = await userService.getProfileService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy thông tin hồ sơ thành công", profile));
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { fullName, dob, gender, address, phoneNumber } = req.body || {};
  // Nếu có file avatar
  let avatar;
  if (req.file?.buffer) {
    const uploaded = await uploadBuffer(req.file.buffer, "profiles");
    avatar = uploaded.secure_url;
  }

  // Tạo object chứa những trường tồn tại trong req.body
  const updateData = {};
  if (fullName !== undefined) updateData.fullName = fullName;
  if (dob !== undefined) updateData.dob = dob;
  if (gender !== undefined) updateData.gender = gender;
  if (address !== undefined) updateData.address = address;
  if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
  if (avatar) updateData.avatar = avatar;

  const data = { updateData, userId };

  // Gọi service
  const profileUpdate = await userService.updateProfileService(data);

  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật profile thành công", profileUpdate));
});

const updateUserInfo = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { fullName, address, phoneNumber } = req.body || {};

  // Tạo object chứa những trường tồn tại trong req.body
  const updateUserData = {};
  if (fullName !== undefined) updateUserData.fullName = fullName;
  if (address !== undefined) updateUserData.address = address;
  if (phoneNumber !== undefined) updateUserData.phoneNumber = phoneNumber;

  const data = { updateUserData, userId };

  // Gọi service
  const profileUpdate = await userService.updateUserInfoService(data);

  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Cập nhật thông tin cá nhân thành công",
        profileUpdate,
      ),
    );
});

const userController = {
  getProfile,
  updateProfile,
  updateUserInfo,
};
export default userController;
