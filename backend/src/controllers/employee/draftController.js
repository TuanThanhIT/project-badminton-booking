import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import draftService from "../../services/employee/draftService.js";

const createDraft = asyncHandler(async (req, res) => {
  const data = { employeeId: req.user.id, ...req.body };
  await draftService.createDraftService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Tạo đơn tạm thời cho khách hàng thành công"));
});

const getDrafts = asyncHandler(async (req, res) => {
  const draftBookings = await draftService.getDraftsService();
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy danh sách đơn tạm thời thành công",
        draftBookings,
      ),
    );
});

const createAndUpdateDraft = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  await draftService.createAndUpdateDraftService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Lưu đơn tạm thời thành công"));
});

const getDraft = asyncHandler(async (req, res) => {
  const { draftId } = req.params;
  const data = { draftId };
  const draftBooking = await draftService.getDraftService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy đơn tạm thời thành công", draftBooking));
});

const deleteDraft = asyncHandler(async (req, res) => {
  const { draftId } = req.params;
  const data = { draftId };
  await draftService.deleteDraftService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Xóa đơn tạm thời thành công"));
});

const draftController = {
  createDraft,
  getDrafts,
  createAndUpdateDraft,
  getDraft,
  deleteDraft,
};
export default draftController;
