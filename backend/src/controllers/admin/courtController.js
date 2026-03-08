import courtService from "../../services/admin/courtService.js";
import uploadBuffer from "../../utils/cloudinary.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import SuccessResponse from "../../helpers/SuccessResponse.js";

const createCourt = asyncHandler(async (req, res) => {
  // Nếu có file avatar
  let thumbnailUrl;
  if (req.file?.buffer) {
    const uploaded = await uploadBuffer(req.file.buffer, "courts");
    thumbnailUrl = uploaded.secure_url;
  }
  const data = { thumbnailUrl, ...req.body };
  const court = await courtService.createCourtService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Tạo thông tin sân thành công", court));
});

const createCourtPrice = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  const courtPrice = await courtService.createCourtPriceService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Tạo giá sân thành công", courtPrice));
});

const createWeeklySlots = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  await courtService.createWeeklySlotsService(data);
  return res
    .status(201)
    .json(new SuccessResponse("Đã tạo slot 7 ngày cho tất cả sân"));
});

const updateCourt = asyncHandler(async (req, res) => {
  const { courtId } = req.params;
  const updateData = { ...req.body };
  // Nếu có file upload thì upload lên Cloudinary
  if (req.file?.path) {
    const upload = await uploadFile(req.file.path);
    updateData.thumbnailUrl = upload.secure_url;
  }
  const data = { courtId, updateData };
  const court = await courtService.updateCourtService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Cập nhật thông tin sân thành công", court));
});

const getAllCourts = asyncHandler(async (req, res) => {
  const courts = await courtService.getAllCourtsService();
  return res
    .status(200)
    .json(new SuccessResponse("Lấy tất cả sân thành công", courts));
});

const getCourtById = asyncHandler(async (req, res) => {
  const { courtId } = req.params;
  const data = { courtId };
  const court = await courtService.getCourtByIdService(data);
  return res
    .status(200)
    .json(new SuccessResponse("Lấy thông tin sân thành công", court));
});

const courtController = {
  createCourt,
  createCourtPrice,
  createWeeklySlots,
  updateCourt,
  getAllCourts,
  getCourtById,
};
export default courtController;
