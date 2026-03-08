import SuccessResponse from "../../helpers/SuccessResponse.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import beverageService from "../../services/admin/beverageService.js";
import uploadBuffer from "../../utils/cloudinary.js";
import uploadFile from "../../utils/upload.js";

const addBeverage = asyncHandler(async (req, res) => {
  let thumbnailUrl;
  if (req.file?.buffer) {
    const uploaded = await uploadBuffer(req.file.buffer, "beverages");
    thumbnailUrl = uploaded.secure_url;
  }
  const data = { thumbnailUrl, ...req.body };
  const beverage = await beverageService.addBeverageService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Tạo thông tin đồ uống thành công", beverage));
});

const updateBeverage = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (req.file?.path) {
    const upload = await uploadFile(req.file.path);
    updateData.thumbnailUrl = upload.secure_url;
  }
  const { beverageId } = req.params;
  const data = { beverageId, updateData };
  const beverage = await beverageService.updateBeverageService(data);
  return res
    .status(200)
    .json(
      new SuccessResponse("Cập nhật thông tin đồ uống thành công", beverage),
    );
});

const getBeverageById = asyncHandler(async (req, res) => {
  const { beverageId } = req.params;
  const data = { beverageId };
  const beverage = await beverageService.getBeverageByIdService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy đồ uống thành công", beverage));
});

const getAllBeverages = asyncHandler(async (req, res) => {
  const data = { ...req.query };
  const result = await beverageService.getAllBeveragesService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy tất cả đồ uống thành công", result));
});

const beverageController = {
  addBeverage,
  updateBeverage,
  getBeverageById,
  getAllBeverages,
};
export default beverageController;
