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

const discountController = {
  applyDiscount,
};
export default discountController;
