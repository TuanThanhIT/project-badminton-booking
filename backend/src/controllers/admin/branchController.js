import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import adminBranchService from "../../services/admin/branchService.js";

const getAdminBranchesController = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const result = await adminBranchService.getAdminBranchesService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách chi nhánh thành công", result));
});

const getAdminBranchDetailController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const result = await adminBranchService.getAdminBranchDetailService(branchId);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy chi tiết chi nhánh thành công", result));
});

const createBranchController = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const result = await adminBranchService.createBranchService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Tạo chi nhánh thành công", result));
});

const updateBranchController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const data = { ...req.body };
  const result = await adminBranchService.updateBranchService(branchId, data);
  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật chi nhánh thành công", result));
});

const toggleBranchActiveController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const result = await adminBranchService.toggleBranchActiveService(branchId);
  return res
    .status(200)
    .json(
      new SuccessResponse(
        result.isActive ? "Mở khóa chi nhánh thành công" : "Khóa chi nhánh thành công",
        result,
      ),
    );
});

const addBranchImageController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const { imageUrl } = req.body;
  const result = await adminBranchService.addBranchImageService(branchId, imageUrl);
  return res.status(201).json(new SuccessResponse("Thêm ảnh thành công", result));
});

const deleteBranchImageController = asyncHandler(async (req, res) => {
  const { branchId, imageId } = req.params;
  await adminBranchService.deleteBranchImageService(branchId, imageId);
  return res.status(200).json(new SuccessResponse("Đã xóa ảnh"));
});

const adminBranchController = {
  getAdminBranchesController,
  getAdminBranchDetailController,
  createBranchController,
  updateBranchController,
  toggleBranchActiveController,
  addBranchImageController,
  deleteBranchImageController,
};

export default adminBranchController;
