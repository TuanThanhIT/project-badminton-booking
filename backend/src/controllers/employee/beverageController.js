import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import beverageService from "../../services/employee/beverageService.js";

const getBeverages = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const beverages = await beverageService.getBeveragesService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách đồ uống thành công", beverages));
});

const beverageController = {
  getBeverages,
};
export default beverageController;
