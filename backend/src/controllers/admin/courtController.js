import courtService from "../../services/admin/courtService.js";
import uploadFile from "../../utils/upload.js";

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

const courtController = {
  createCourt,
  createCourtPrice,
  createWeeklySlots,
};
export default courtController;
