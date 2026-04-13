import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import courtService from "../../services/user/courtService.js";

const getCourtsController = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const courts = await courtService.getCourtsService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách sân thành công", courts));
});

const courtController = {
  getCourtsController,
};

export default courtController;
