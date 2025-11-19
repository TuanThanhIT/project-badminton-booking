import discountService from "../../services/admin/discountService.js";

const createDiscount = async (req, res, next) => {
  try {
    const { code, type, value, startDate, endDate, minOrderAmount } = req.body;
    const discount = await discountService.createDiscountService(
      code,
      type,
      value,
      startDate,
      endDate,
      minOrderAmount
    );
    return res.status(201).json(discount);
  } catch (error) {
    next(error);
  }
};

const discountController = {
  createDiscount,
};

export default discountController;
