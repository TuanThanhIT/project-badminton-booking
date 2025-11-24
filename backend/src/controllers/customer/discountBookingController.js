import discountBookingService from "../../services/customer/discountBookingService.js";

const applyDiscountBooking = async (req, res, next) => {
  try {
    const { code, bookingAmount } = req.body;
    const data = await discountBookingService.applyDiscountBookingService(
      code,
      bookingAmount
    );
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const updateDiscountBooking = async (req, res, next) => {
  try {
    const { code } = req.body;
    await discountBookingService.updateDiscountBookingService(code);
    return res
      .status(200)
      .json({ message: "Mã giảm giá đã được ghi nhận và áp dụng." });
  } catch (error) {
    next(error);
  }
};

const getDiscountBooking = async (req, res, next) => {
  try {
    const discountBookings =
      await discountBookingService.getDiscountBookingService();
    return res.status(200).json(discountBookings);
  } catch (error) {
    next(error);
  }
};

const discountBookingController = {
  applyDiscountBooking,
  updateDiscountBooking,
  getDiscountBooking,
};
export default discountBookingController;
