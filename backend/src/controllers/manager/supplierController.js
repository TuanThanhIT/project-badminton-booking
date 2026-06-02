import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import supplierService from "../../services/manager/supplierService.js";

const getSuppliersController = asyncHandler(async (req, res) => {
  const result = await supplierService.getSuppliersService(req.query);
  return res.json(new SuccessResponse("Get suppliers successfully", result));
});

export default {
  getSuppliersController,
};
