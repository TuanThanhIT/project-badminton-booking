import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import { Op } from "sequelize";
import { WorkShift } from "../../models/index.js";

const createWorkShiftService = async (
  name,
  workDate,
  startTime,
  endTime,
  shiftWage
) => {
  try {
    // 1. Validate ngày
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shiftDate = new Date(workDate);
    shiftDate.setHours(0, 0, 0, 0);

    if (isNaN(shiftDate.getTime())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Ngày làm không hợp lệ!");
    }

    if (shiftDate < today) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Không thể tạo ca làm cho ngày đã qua!"
      );
    }

    // 2. Validate thời gian (ghép vào Date để so sánh)
    const start = new Date(`${workDate}T${startTime}:00`);
    const end = new Date(`${workDate}T${endTime}:00`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Thời gian bắt đầu hoặc kết thúc không hợp lệ!"
      );
    }

    if (start >= end) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!"
      );
    }

    // 3. Validate shiftWage
    if (shiftWage < 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Tiền công ca làm không hợp lệ!"
      );
    }

    // 4. Kiểm tra trùng ca
    // Điều kiện overlap chuẩn:
    // (start < existingEnd) && (end > existingStart)
    const overlap = await WorkShift.findOne({
      where: {
        workDate,
        [Op.and]: [
          { startTime: { [Op.lt]: endTime } },
          { endTime: { [Op.gt]: startTime } },
        ],
      },
    });

    if (overlap) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Ca làm bị trùng thời gian với ca khác!"
      );
    }

    // 5. Lưu ca làm
    const shift = await WorkShift.create({
      name,
      workDate,
      startTime,
      endTime,
      shiftWage,
    });

    return shift;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

const workShiftService = {
  createWorkShiftService,
};

export default workShiftService;
