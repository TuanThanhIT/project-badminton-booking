import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import profileService from "../../services/user/profileService.js";

const getMyProfileController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id };
  const profile = await profileService.getMyProfileService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy hồ sơ cá nhân thành công", profile));
});

const updateMyProfileController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id, ...req.body };
  const profile = await profileService.updateMyProfileService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật hồ sơ cá nhân thành công", profile));
});

const getPublicProfileController = asyncHandler(async (req, res) => {
  const data = { userId: req.params.userId };
  const profile = await profileService.getPublicProfileService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy hồ sơ công khai thành công", profile));
});

const uploadMyAvatarController = asyncHandler(async (req, res) => {
  const data = { userId: req.user.id, file: req.file };
  const profile = await profileService.uploadMyAvatarService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật ảnh đại diện thành công", profile));
});

const profileController = {
  getMyProfileController,
  updateMyProfileController,
  uploadMyAvatarController,
  getPublicProfileController,
};

export default profileController;
