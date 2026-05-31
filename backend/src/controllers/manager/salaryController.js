import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import salaryService from "../../services/manager/salaryService.js";

const getMonthlySalary = asyncHandler(async (req, res) => {
  const result = await salaryService.getManagerMonthlySalaryService(
    req.user.id,
    req.query,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Get monthly salary successfully", result));
});

export default {
  getMonthlySalary,
};
