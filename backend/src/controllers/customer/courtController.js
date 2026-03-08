import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import courtService from "../../services/customer/courtService.js";

const getCourts = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const courts = await courtService.getCourtsService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách sân thành công", courts));
});

const getCourtSchedule = asyncHandler(async (req, res) => {
  const { courtId } = req.params;
  const data = { courtId, ...req.query };
  const courtSchedule = await courtService.getCourtScheduleService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy lịch đặt sân thành công", courtSchedule));
});

const getCourtPrice = asyncHandler(async (req, res) => {
  const courtPrices = await courtService.getCourtPriceService();
  return res
    .status(200)
    .json(new SuccessResponse("Lấy giá đặt sân thành công", courtPrices));
});

const courtController = {
  getCourts,
  getCourtSchedule,
  getCourtPrice,
};
export default courtController;
