import roleService from "../../services/admin/roleService.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import SuccessResponse from "../../helpers/SuccessResponse.js";

const createRole = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const role = await roleService.createRoleService(data);
  return res.status(201).json(new SuccessResponse("Tạo role thành công", role));
});

const roleController = {
  createRole,
};
export default roleController;
