import offlineService from "../../services/employee/offlineService.js";

const createOffline = async (req, res, next) => {
  try {
    const employeeId = req.user.id;
    const draftId = req.params.id;
    const offlineBooking = await offlineService.createOfflineService(
      draftId,
      employeeId
    );
    return res.status(201).json(offlineBooking);
  } catch (error) {
    next(error);
  }
};

const updateOffline = async (req, res, next) => {
  try {
    const offlineBookingId = req.params.id;
    const { paymentMethod, total } = req.body;
    await offlineService.updateOfflineService(
      offlineBookingId,
      paymentMethod,
      total
    );
    return res.status(200).json({
      success: true,
      message: "Thanh toán đã được hoàn tất thành công!",
    });
  } catch (error) {
    next(error);
  }
};

const offlineController = {
  createOffline,
  updateOffline,
};
export default offlineController;
