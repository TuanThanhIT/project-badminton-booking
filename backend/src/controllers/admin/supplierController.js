import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import supplierService from "../../services/admin/supplierService.js";

const getSuppliersController = asyncHandler(async (req, res) => {
  const result = await supplierService.getSuppliersService(req.query);
  return res.json(new SuccessResponse("Lấy danh sách nhà cung cấp thành công", result));
});

const createSupplierController = asyncHandler(async (req, res) => {
  const result = await supplierService.createSupplierService(req.body);
  return res.status(201).json(new SuccessResponse("Tạo nhà cung cấp thành công", result));
});

const updateSupplierController = asyncHandler(async (req, res) => {
  const result = await supplierService.updateSupplierService(
    req.params.supplierId,
    req.body,
  );
  return res.json(new SuccessResponse("Cập nhật nhà cung cấp thành công", result));
});

const updateSupplierStatusController = asyncHandler(async (req, res) => {
  const result = await supplierService.updateSupplierStatusService(
    req.params.supplierId,
    req.body.status,
  );
  return res.json(new SuccessResponse("Cập nhật trạng thái nhà cung cấp thành công", result));
});

const deleteSupplierController = asyncHandler(async (req, res) => {
  const result = await supplierService.deleteSupplierService(req.params.supplierId);
  return res.json(new SuccessResponse("Xóa nhà cung cấp thành công", result));
});

export default {
  getSuppliersController,
  createSupplierController,
  updateSupplierController,
  updateSupplierStatusController,
  deleteSupplierController,
};
