import discountBookingService from "../../services/admin/discountBookingService.js";

const createDiscountBooking = async (req, res, next) => {
  try {
    const { code, type, value, startDate, endDate, minBookingAmount } =
      req.body;

    await discountBookingService.createDiscountBookingService(
      code,
      type,
      value,
      startDate,
      endDate,
      minBookingAmount
    );
    return res
      .status(201)
      .json({ message: "Tạo mã giảm giá cho đặt sân thành công!" });
  } catch (error) {
    next(error);
  }
};

const getDiscountBookings = async (req, res, next) => {
  try {
    const { isUsed, type, page, limit } = req.query;
    const filter = {
      isUsed,
      type,
    };
    const discountBookings =
      await discountBookingService.getDiscountBookingsService(
        filter,
        page,
        limit
      );
    return res.status(200).json(discountBookings);
  } catch (error) {
    next(error);
  }
};

const updateDiscountBooking = async (req, res, next) => {
  try {
    const discountId = req.params.id;
    await discountBookingService.updateDiscountBookingService(discountId);
    return res
      .status(200)
      .json({ message: "Thay đổi trạng thái mã giảm giá thành công!" });
  } catch (error) {
    next(error);
  }
};

const deleteDiscountBooking = async (req, res, next) => {
  try {
    const discountId = req.params.id;
    await discountBookingService.deleteDiscountBookingService(discountId);
    return res
      .status(200)
      .json({ message: "Xóa mã giảm giá đặt sân thành công!" });
  } catch (error) {
    next(error);
  }
};

const discountBookingController = {
  createDiscountBooking,
  updateDiscountBooking,
  deleteDiscountBooking,
  getDiscountBookings,
};

export default discountBookingController;
