import courtService from "../../services/admin/courtService.js";
import uploadFile from "../../utils/upload.js";
import { StatusCodes } from "http-status-codes";

const createCourt = async (req, res, next) => {
  try {
    const { name, location } = req.body;
    // Nếu có file avatar
    let thumbnailUrl;
    if (req.file?.path) {
      const upload = await uploadFile(req.file.path);
      thumbnailUrl = upload.secure_url;
    }

    const court = await courtService.createCourtService(
      name,
      location,
      thumbnailUrl
    );
    return res.status(201).json(court);
  } catch (error) {
    next(error);
  }
};

const createCourtPrice = async (req, res, next) => {
  try {
    const { dayOfWeek, startTime, endTime, price, periodType } = req.body;
    const courtPrice = await courtService.createCourtPriceService(
      dayOfWeek,
      startTime,
      endTime,
      price,
      periodType
    );
    return res.status(201).json(courtPrice);
  } catch (error) {
    next(error);
  }
};

export const createWeeklySlots = async (req, res, next) => {
  try {
    const { startDate } = req.body;
    await courtService.createWeeklySlotsService(startDate);
    return res
      .status(201)
      .json({ message: "Đã tạo slot 7 ngày cho tất cả sân!" });
  } catch (error) {
    next(error);
  }
};
const updateCourt = async (req, res, next) => {
  try {
    const { courtId } = req.params;
    const data = req.body;

    const result = await courtService.updateCourt(courtId, data);

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getAllCourts = async (req, res, next) => {
  try {
    const courts = await courtService.getAllCourtsService();

    return res.status(StatusCodes.OK).json({
      message: "Lấy danh sách sân thành công!",
      courts,
    });
  } catch (error) {
    next(error);
  }
};

const getCourtById = async (req, res, next) => {
  try {
    const { courtId } = req.params;
    const court = await courtService.getCourtById(courtId);

    return res.status(StatusCodes.OK).json({
      message: "Lấy thông tin sân thành công!",
      court,
    });
  } catch (error) {
    next(error);
  }
};
const courtController = {
  createCourt,
  createCourtPrice,
  createWeeklySlots,
  updateCourt,
  getAllCourts,
  getCourtById,
};
export default courtController;
