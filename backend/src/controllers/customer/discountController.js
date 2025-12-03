import discountService from "../../services/customer/discountService.js";

const applyDiscount = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    const data = await discountService.applyDiscountService(code, orderAmount);
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const updateDiscount = async (req, res, next) => {
  try {
    const { code } = req.body;
    await discountService.updateDiscountService(code);
    return res
      .status(200)
      .json({ message: "Mã giảm giá đã được ghi nhận và áp dụng." });
  } catch (error) {
    next(error);
  }
};

const getDiscount = async (req, res, next) => {
  try {
    const discounts = await discountService.getDiscountService();
    return res.status(200).json(discounts);
  } catch (error) {
    next(error);
  }
};

const discountController = {
  applyDiscount,
  updateDiscount,
  getDiscount,
};
export default discountController;
