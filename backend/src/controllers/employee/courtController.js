import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import courtService from "../../services/employee/courtService.js";

const getCourtScheduleByDate = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const courtSchedules = await courtService.getCourtScheduleByDateService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Lấy lịch sân theo ngày thành công", courtSchedules),
    );
});

const courtController = {
  getCourtScheduleByDate,
};
export default courtController;
