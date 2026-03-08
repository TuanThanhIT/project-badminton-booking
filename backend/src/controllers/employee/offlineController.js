import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import offlineService from "../../services/employee/offlineService.js";

const createOffline = asyncHandler(async (req, res) => {
  const { draftId } = req.params;
  const data = { employeeId: req.user.id, draftId };
  const offlineBooking = await offlineService.createOfflineService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Tạo đơn offline thành công", offlineBooking));
});

const updateOffline = asyncHandler(async (req, res) => {
  const { offlineBookingId } = req.params;
  const data = { offlineBookingId, ...req.body };
  const offlineBooking = await offlineService.updateOfflineService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Thanh toán đã được hoàn tất thành công",
        offlineBooking,
      ),
    );
});

const offlineController = {
  createOffline,
  updateOffline,
};
export default offlineController;
