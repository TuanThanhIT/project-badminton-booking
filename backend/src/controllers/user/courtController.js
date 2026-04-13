import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import courtService from "../../services/user/courtService.js";

const getAvailableCourtsController = asyncHandler(async (req, res) => {
  // query gồm: branchId, date, startTime, endTime
  const query = { ...req.query };

  const result = await courtService.getAvailableCourtsService(query);

  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách sân trống thành công", result));
});

const getCourtByIdController = asyncHandler(async (req, res) => {
  const { courtId } = req.params;

  const result = await courtService.getCourtByIdService(courtId);

  return res
    .status(200)
    .json(new SuccessResponse("Lấy thông tin sân thành công", result));
});

const courtController = {
  getAvailableCourtsController,
  getCourtByIdController,
};

export default courtController;
