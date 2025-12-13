import discountService from "../../services/admin/discountService.js";

const createDiscount = async (req, res, next) => {
  try {
    const { code, type, value, startDate, endDate, minOrderAmount } = req.body;
    await discountService.createDiscountService(
      code,
      type,
      value,
      startDate,
      endDate,
      minOrderAmount
    );
    return res
      .status(201)
      .json({ message: "Tạo mã giảm giá cho đơn hàng thành công!" });
  } catch (error) {
    next(error);
  }
};

const getDiscounts = async (req, res, next) => {
  try {
    const { isUsed, type, page, limit } = req.query;
    const filter = {
      isUsed,
      type,
    };
    const discounts = await discountService.getDiscountsService(
      filter,
      page,
      limit
    );
    return res.status(200).json(discounts);
  } catch (error) {
    next(error);
  }
};

const updateDiscount = async (req, res, next) => {
  try {
    const discountId = req.params.id;
    await discountService.updateDiscountService(discountId);
    return res
      .status(200)
      .json({ message: "Thay đổi trạng thái mã giảm giá thành công!" });
  } catch (error) {
    next(error);
  }
};

const deleteDiscount = async (req, res, next) => {
  try {
    const discountId = req.params.id;
    await discountService.deleteDiscountService(discountId);
    return res
      .status(200)
      .json({ message: "Xóa mã giảm giá đơn hàng thành công!" });
  } catch (error) {
    next(error);
  }
};

const discountController = {
  createDiscount,
  getDiscounts,
  updateDiscount,
  deleteDiscount,
};

export default discountController;
