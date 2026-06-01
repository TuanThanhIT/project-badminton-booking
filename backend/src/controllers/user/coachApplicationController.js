import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import coachApplicationUserService from "../../services/user/coachApplicationService.js";

const getMyCoachApplicationController = asyncHandler(async (req, res) => {
  const data = await coachApplicationUserService.getMyCoachApplicationService({
    userId: req.user.id,
  });
  return res
    .status(200)
    .json(new SuccessResponse("Lấy yêu cầu dạy cầu lông của bạn thành công", data));
});

const submitCoachApplicationController = asyncHandler(async (req, res) => {
  const data = await coachApplicationUserService.submitCoachApplicationService({
    userId: req.user.id,
    ...req.body,
  });
  return res
    .status(201)
    .json(new SuccessResponse("Gửi yêu cầu đăng ký dạy cầu lông thành công", data));
});

const uploadApplicationCertificatesController = asyncHandler(async (req, res) => {
  const data =
    await coachApplicationUserService.uploadApplicationCertificateImagesService({
      userId: req.user.id,
      files: req.files,
    });
  return res
    .status(200)
    .json(new SuccessResponse("Tải ảnh chứng chỉ thành công", data));
});

const coachApplicationUserController = {
  getMyCoachApplicationController,
  submitCoachApplicationController,
  uploadApplicationCertificatesController,
};

export default coachApplicationUserController;
