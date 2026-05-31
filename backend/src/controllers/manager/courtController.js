import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";

import courtService from "../../services/manager/courtService.js";

const createCourtController = asyncHandler(async (req, res) => {
  const managerId = req.user.id;

  const court = await courtService.createCourtService(managerId, req.body);

  return res
    .status(201)
    .json(new SuccessResponse("Thêm sân mới thành công", court));
});

const createCourtPriceController = asyncHandler(async (req, res) => {
  const managerId = req.user.id;

  const courtPrice = await courtService.createCourtPriceService(
    managerId,
    req.body,
  );

  return res
    .status(201)
    .json(new SuccessResponse("Thêm giá sân thành công", courtPrice));
});

const getCourtsController = asyncHandler(async (req, res) => {
  const managerId = req.user.id;

  const courts = await courtService.getCourtsService(managerId);

  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách sân thành công", courts));
});

const getCourtPricesController = asyncHandler(async (req, res) => {
  const managerId = req.user.id;

  const courtPrices = await courtService.getCourtPricesService(managerId);

  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách giá sân thành công", courtPrices));
});

const updateCourtController = asyncHandler(async (req, res) => {
  const managerId = req.user.id;

  const { courtId } = req.params;

  const court = await courtService.updateCourtService(
    managerId,
    courtId,
    req.body,
  );

  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật sân thành công", court));
});

const maintenanceCourtController = asyncHandler(async (req, res) => {
  const managerId = req.user.id;

  const { courtId } = req.params;

  const court = await courtService.maintenanceCourtService(managerId, courtId);

  return res
    .status(200)
    .json(new SuccessResponse("Khóa sân thành công", court));
});

const closeCourtController = asyncHandler(async (req, res) => {
  const managerId = req.user.id;

  const { courtId } = req.params;

  const court = await courtService.closeCourtService(managerId, courtId);

  return res.status(200).json(new SuccessResponse("Xóa sân thành công", court));
});

const courtController = {
  createCourtController,
  createCourtPriceController,
  getCourtsController,
  getCourtPricesController,
  updateCourtController,
  maintenanceCourtController,
  closeCourtController,
};

export default courtController;
