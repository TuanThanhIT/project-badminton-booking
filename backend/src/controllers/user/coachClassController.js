import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import coachClassService from "../../services/user/coachClassService.js";

const getCoachDashboardController = asyncHandler(async (req, res) => {
  const data = await coachClassService.getCoachDashboardService({
    coachUserId: req.user.id,
  });
  return res
    .status(200)
    .json(new SuccessResponse("Lấy tổng quan lớp học thành công", data));
});

const getCoachClassesController = asyncHandler(async (req, res) => {
  const data = await coachClassService.getCoachClassesService({
    coachUserId: req.user.id,
  });
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách lớp học thành công", data));
});

const getCoachEnrollmentsController = asyncHandler(async (req, res) => {
  const data = await coachClassService.getCoachEnrollmentsService({
    coachUserId: req.user.id,
    ...req.query,
  });
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách học viên thành công", data));
});

const getMyEnrollmentsController = asyncHandler(async (req, res) => {
  const data = await coachClassService.getMyEnrollmentsService({
    studentUserId: req.user.id,
    ...req.query,
  });
  return res
    .status(200)
    .json(new SuccessResponse("Lấy đăng ký lớp học của bạn thành công", data));
});

const getPostEnrollmentContextController = asyncHandler(async (req, res) => {
  const data = await coachClassService.getPostEnrollmentContextService({
    postId: req.params.postId,
    userId: req.user.id,
  });
  return res
    .status(200)
    .json(new SuccessResponse("Lấy trạng thái đăng ký lớp thành công", data));
});

const enrollInClassController = asyncHandler(async (req, res) => {
  const data = await coachClassService.enrollInClassService({
    postId: req.params.postId,
    studentUserId: req.user.id,
  });
  return res
    .status(201)
    .json(new SuccessResponse("Gửi yêu cầu đăng ký lớp thành công", data));
});

const updateEnrollmentController = asyncHandler(async (req, res) => {
  const data = await coachClassService.updateEnrollmentService({
    coachUserId: req.user.id,
    enrollmentId: req.params.enrollmentId,
    ...req.body,
  });
  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật học viên thành công", data));
});

const addMemberManuallyController = asyncHandler(async (req, res) => {
  const data = await coachClassService.addMemberManuallyService({
    coachUserId: req.user.id,
    postId: req.params.postId,
    studentUserId: req.body.studentUserId,
  });
  return res
    .status(201)
    .json(new SuccessResponse("Thêm học viên vào lớp thành công", data));
});

const cancelEnrollmentController = asyncHandler(async (req, res) => {
  const data = await coachClassService.cancelEnrollmentService({
    enrollmentId: req.params.enrollmentId,
    studentUserId: req.user.id,
  });
  return res
    .status(200)
    .json(new SuccessResponse("Đã hủy đăng ký lớp học", data));
});

const getOrCreateClassConversationController = asyncHandler(async (req, res) => {
  const data = await coachClassService.getOrCreateClassConversationService({
    coachUserId: req.user.id,
    postId: req.params.postId,
  });
  return res
    .status(200)
    .json(new SuccessResponse("Lấy nhóm chat lớp thành công", data));
});

const notifyClassMembersController = asyncHandler(async (req, res) => {
  const data = await coachClassService.notifyClassMembersService({
    coachUserId: req.user.id,
    postId: req.params.postId,
    ...req.body,
  });
  return res
    .status(200)
    .json(new SuccessResponse("Gửi thông báo lớp thành công", data));
});

const updateClassStatusController = asyncHandler(async (req, res) => {
  const data = await coachClassService.updateClassStatusService({
    coachUserId: req.user.id,
    postId: req.params.postId,
    action: req.body.action,
  });
  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật trạng thái lớp thành công", data));
});

const coachClassController = {
  getCoachDashboardController,
  getCoachClassesController,
  getCoachEnrollmentsController,
  getMyEnrollmentsController,
  getPostEnrollmentContextController,
  enrollInClassController,
  updateEnrollmentController,
  addMemberManuallyController,
  cancelEnrollmentController,
  getOrCreateClassConversationController,
  notifyClassMembersController,
  updateClassStatusController,
};

export default coachClassController;
