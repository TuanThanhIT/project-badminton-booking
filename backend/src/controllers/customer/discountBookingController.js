import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import discountBookingService from "../../services/customer/discountBookingService.js";

const applyDiscountBooking = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const discountBooking =
    await discountBookingService.applyDiscountBookingService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Áp mã giảm giá thành công", discountBooking));
});

const updateDiscountBooking = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const discountBooking =
    await discountBookingService.updateDiscountBookingService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Mã giảm giá đã được ghi nhận và áp dụng.",
        discountBooking,
      ),
    );
});

const getDiscountBooking = asyncHandler(async (req, res) => {
  const discountBookings =
    await discountBookingService.getDiscountBookingService();
  return res
    .status(200)
    .json(
      new SuccessResponse(
        "Lấy danh sách mã giảm giá đặt sân thành công",
        discountBookings,
      ),
    );
});

const discountBookingController = {
  applyDiscountBooking,
  updateDiscountBooking,
  getDiscountBooking,
};
export default discountBookingController;
