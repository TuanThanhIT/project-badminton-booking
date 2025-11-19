import discountBookingService from "../../services/admin/discountBookingService.js";

const createDiscountBooking = async (req, res, next) => {
  try {
    const { code, type, value, startDate, endDate, minBookingAmount } =
      req.body;

    const discountBooking =
      await discountBookingService.createDiscountBookingService(
        code,
        type,
        value,
        startDate,
        endDate,
        minBookingAmount
      );
    return res.status(201).json(discountBooking);
  } catch (error) {
    next(error);
  }
};

const discountBookingController = {
  createDiscountBooking,
};

export default discountBookingController;
