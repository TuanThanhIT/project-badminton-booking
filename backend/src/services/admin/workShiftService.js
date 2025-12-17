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
const createWorkShiftsService = async (workDate, shiftWage) => {
  // Kiểm tra đã tồn tại ca trong ngày chưa
  const existed = await WorkShift.findOne({
    where: { workDate },
  });

  if (existed) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Ngày này đã được tạo ca làm việc!"
    );
  }

  const shifts = [
    {
      name: "Ca sáng",
      workDate,
      startTime: "07:00",
      endTime: "12:00",
      shiftWage,
    },
    {
      name: "Ca chiều",
      workDate,
      startTime: "12:00",
      endTime: "17:00",
      shiftWage,
    },
    {
      name: "Ca tối",
      workDate,
      startTime: "17:00",
      endTime: "22:00",
      shiftWage,
    },
  ];

  const createdShifts = await WorkShift.bulkCreate(shifts);

  return createdShifts;
};

const getAllWorkShiftsService = async ({ page = 1, limit = 10, workDate }) => {
  const offset = (page - 1) * limit;

  const whereCondition = workDate ? { workDate } : {};

  const { rows, count } = await WorkShift.findAndCountAll({
    where: whereCondition,
    order: [
      ["workDate", "DESC"],
      ["startTime", "ASC"],
    ],
    limit,
    offset,
  });

  return {
    workShifts: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const workShiftService = {
  createWorkShiftService,
  createWorkShiftsService,
  getAllWorkShiftsService,
};

export default workShiftService;
