import discountBookingService from "../../services/admin/discountBookingService.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import SuccessResponse from "../../helpers/SuccessResponse.js";

const createDiscountBooking = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const discount =
    await discountBookingService.createDiscountBookingService(data);
  return res
    .status(201)
    .json(
      new SuccessResponse("Tạo mã giảm giá cho đặt sân thành công", discount),
    );
});

const getDiscountBookings = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const discountBookings =
    await discountBookingService.getDiscountBookingsService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy tất cả mã giảm giá đặt sân thành công",
        discountBookings,
      ),
    );
});

const updateDiscountBooking = asyncHandler(async (req, res) => {
  const { discountId } = req.params;
  const data = { discountId };
  const discountBooking =
    await discountBookingService.updateDiscountBookingService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Thay đổi trạng thái mã giảm giá thành công",
        discountBooking,
      ),
    );
});

const deleteDiscountBooking = asyncHandler(async (req, res) => {
  const { discountId } = req.params;
  const data = { discountId };
  await discountBookingService.deleteDiscountBookingService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Xóa mã giảm giá đặt sân thành công"));
});

const discountBookingController = {
  createDiscountBooking,
  updateDiscountBooking,
  deleteDiscountBooking,
  getDiscountBookings,
};

export default discountBookingController;
