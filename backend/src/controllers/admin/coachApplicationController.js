import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import coachApplicationAdminService from "../../services/admin/coachApplicationService.js";

const getCoachApplicationsController = asyncHandler(async (req, res) => {
  const data = await coachApplicationAdminService.getCoachApplicationsService(
    req.query,
  );
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách yêu cầu dạy cầu lông thành công", data));
});

const getCoachApplicationDetailController = asyncHandler(async (req, res) => {
  const data = await coachApplicationAdminService.getCoachApplicationByIdService(
    req.params.id,
  );
  return res
    .status(200)
    .json(new SuccessResponse("Lấy chi tiết yêu cầu dạy cầu lông thành công", data));
});

const approveCoachApplicationController = asyncHandler(async (req, res) => {
  const data = await coachApplicationAdminService.approveCoachApplicationService({
    applicationId: req.params.id,
    adminId: req.user.id,
  });
  return res
    .status(200)
    .json(new SuccessResponse("Duyệt yêu cầu dạy cầu lông thành công", data));
});

const rejectCoachApplicationController = asyncHandler(async (req, res) => {
  const data = await coachApplicationAdminService.rejectCoachApplicationService({
    applicationId: req.params.id,
    adminId: req.user.id,
    rejectReason: req.body.rejectReason,
  });
  return res
    .status(200)
    .json(new SuccessResponse("Từ chối yêu cầu dạy cầu lông thành công", data));
});

const coachApplicationAdminController = {
  getCoachApplicationsController,
  getCoachApplicationDetailController,
  approveCoachApplicationController,
  rejectCoachApplicationController,
};

export default coachApplicationAdminController;
