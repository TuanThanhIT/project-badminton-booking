import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import homeService from "../../services/user/homeService.js";

const getHomeDataController = asyncHandler(async (req, res) => {
  const data = await homeService.getHomeDataService();
  return res
    .status(200)
    .json(new SuccessResponse("Lấy dữ liệu trang chủ thành công", data));
});

const homeController = {
  getHomeDataController,
};

export default homeController;
