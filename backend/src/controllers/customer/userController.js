import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import userService from "../../services/customer/userService.js";
import uploadBuffer from "../../utils/cloudinary.js";

const getProfile = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id };
  const profile = await userService.getProfileService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy thông tin hồ sơ thành công", profile));
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updateData = { ...req.body };
  if (req.file?.buffer) {
    const uploaded = await uploadBuffer(req.file.buffer, "profiles");
    updateData.avatar = uploaded.secure_url;
  }
  const data = {
    userId,
    updateData,
  };
  const profile = await userService.updateProfileService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật profile thành công", profile));
});

const updateUserInfo = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updateUserData = { ...req.body };
  const data = { updateUserData, userId };
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
