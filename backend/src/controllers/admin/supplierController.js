import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import supplierService from "../../services/admin/supplierService.js";

const getSuppliersController = asyncHandler(async (req, res) => {
  const result = await supplierService.getSuppliersService(req.query);
  return res.json(new SuccessResponse("Get suppliers successfully", result));
});

const createSupplierController = asyncHandler(async (req, res) => {
  const result = await supplierService.createSupplierService(req.body);
  return res.status(201).json(new SuccessResponse("Create supplier successfully", result));
});

const updateSupplierController = asyncHandler(async (req, res) => {
  const result = await supplierService.updateSupplierService(
    req.params.supplierId,
    req.body,
  );
  return res.json(new SuccessResponse("Update supplier successfully", result));
});

const updateSupplierStatusController = asyncHandler(async (req, res) => {
  const result = await supplierService.updateSupplierStatusService(
    req.params.supplierId,
    req.body.status,
  );
  return res.json(new SuccessResponse("Update supplier status successfully", result));
});

const deleteSupplierController = asyncHandler(async (req, res) => {
  const result = await supplierService.deleteSupplierService(req.params.supplierId);
  return res.json(new SuccessResponse("Delete supplier successfully", result));
});

export default {
  getSuppliersController,
  createSupplierController,
  updateSupplierController,
  updateSupplierStatusController,
  deleteSupplierController,
};
