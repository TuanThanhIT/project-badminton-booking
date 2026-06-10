import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import {
  getGhnDistricts,
  getGhnProvinces,
  getGhnWards,
} from "../../services/shared/ghnService.js";

const getProvincesController = asyncHandler(async (req, res) => {
  const provinces = await getGhnProvinces();

  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách tỉnh/thành thành công", provinces));
});

const getDistrictsController = asyncHandler(async (req, res) => {
  const districts = await getGhnDistricts(req.query.provinceId);

  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách quận/huyện thành công", districts));
});

const getWardsController = asyncHandler(async (req, res) => {
  const wards = await getGhnWards(req.query.districtId);

  return res
    .status(200)
    .json(new SuccessResponse("Lấy danh sách phường/xã thành công", wards));
});

const locationController = {
  getProvincesController,
  getDistrictsController,
  getWardsController,
};

export default locationController;
