import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import supplierService from "../../services/manager/supplierService.js";

const getSuppliersController = asyncHandler(async (req, res) => {
  const result = await supplierService.getSuppliersService(req.query);
  return res.status(200).json(new SuccessResponse("Lấy danh sách nhà cung cấp thành công", result));
});

export default {
  getSuppliersController,
};
