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

const getAdminBranchOptionsController = asyncHandler(async (req, res) => {
  const result = await adminBranchService.getAdminBranchOptionsService();
  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách chi nhánh cho bộ lọc thành công", result));
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


const getAdminBranchOverviewController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const result = await adminBranchService.getAdminBranchOverviewService(branchId);
  return res.status(200).json(new SuccessResponse("Lấy tổng quan chi nhánh thành công", result));
});

const getAdminBranchCourtsController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const result = await adminBranchService.getAdminBranchCourtsService(branchId, req.query);
  return res.status(200).json(new SuccessResponse("Lấy danh sách sân của chi nhánh thành công", result));
});

const getAdminBranchEmployeesController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const result = await adminBranchService.getAdminBranchEmployeesService(branchId, req.query);
  return res.status(200).json(new SuccessResponse("Lấy danh sách nhân viên của chi nhánh thành công", result));
});

const getAdminBranchBookingsController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const result = await adminBranchService.getAdminBranchBookingsService(branchId, req.query);
  return res.status(200).json(new SuccessResponse("Lấy danh sách đặt sân của chi nhánh thành công", result));
});

const getAdminBranchOrdersController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const result = await adminBranchService.getAdminBranchOrdersService(branchId, req.query);
  return res.status(200).json(new SuccessResponse("Lấy danh sách đơn hàng của chi nhánh thành công", result));
});

const getAdminBranchInventoryController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const result = await adminBranchService.getAdminBranchInventoryService(branchId, req.query);
  return res.status(200).json(new SuccessResponse("Lấy tồn kho chi nhánh thành công", result));
});

const getAdminBranchPurchaseReceiptsController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const result = await adminBranchService.getAdminBranchPurchaseReceiptsService(branchId, req.query);
  return res.status(200).json(new SuccessResponse("Lấy phiếu nhập chi nhánh thành công", result));
});

const getAdminBranchStockHistoryController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const result = await adminBranchService.getAdminBranchStockHistoryService(branchId, req.query);
  return res.status(200).json(new SuccessResponse("Lấy lịch sử kho chi nhánh thành công", result));
});

const getAdminBranchRevenueController = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const result = await adminBranchService.getAdminBranchRevenueService(branchId, req.query);
  return res.status(200).json(new SuccessResponse("Lấy doanh thu chi nhánh thành công", result));
});
const adminBranchController = {
  getAdminBranchesController,
  getAdminBranchOptionsController,
  getAdminBranchDetailController,
  createBranchController,
  updateBranchController,
  toggleBranchActiveController,
  addBranchImageController,
  deleteBranchImageController,
  getAdminBranchOverviewController,
  getAdminBranchCourtsController,
  getAdminBranchEmployeesController,
  getAdminBranchBookingsController,
  getAdminBranchOrdersController,
  getAdminBranchInventoryController,
  getAdminBranchPurchaseReceiptsController,
  getAdminBranchStockHistoryController,
  getAdminBranchRevenueController,
};

export default adminBranchController;
