import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import beverageService from "../../services/manager/beverageService.js";

const getBeveragesController = asyncHandler(async (req, res) => {
  const managerId = req.user.id;
  const result = await beverageService.getBeveragesService(managerId, req.query);

  return res
    .status(200)
    .json(new SuccessResponse("Get beverages successfully", result));
});

export default {
  getBeveragesController,
};
