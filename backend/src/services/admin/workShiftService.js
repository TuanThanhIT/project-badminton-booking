import { Op } from "sequelize";
import { WorkShift } from "../../models/index.js";
import sequelize from "../../config/db.js";
import BadRequestError from "../../errors/BadRequestError.js";
import ConflictError from "../../errors/ConflictError.js";

const createWorkShiftService = async (data) => {
  const { name, workDate, startTime, endTime, shiftWage } = data;
  return sequelize.transaction(async (t) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shiftDate = new Date(`${workDate}T00:00:00+07:00`);

    if (shiftDate < today) {
      throw new BadRequestError("Không thể tạo ngày trong quá khứ");
    }

    const start = new Date(`${workDate}T${startTime}:00+07:00`);
    const end = new Date(`${workDate}T${endTime}:00+07:00`);

    if (start >= end) {
      throw new BadRequestError(
        "Thời gian bắt đâu phải sớm hơn thời gian kết thúc",
      );
    }

    const overlap = await WorkShift.findOne({
      where: {
        workDate,
        [Op.and]: [
          { startTime: { [Op.lt]: endTime } },
          { endTime: { [Op.gt]: startTime } },
        ],
      },
      transaction: t,
    });

    if (overlap) {
      throw new ConflictError("Ca làm bị trùng thời gian với ca khác");
    }

    const shift = await WorkShift.create(
      {
        name,
        workDate,
        startTime,
        endTime,
        shiftWage,
      },
      { transaction: t },
    );

    return shift;
  });
};

const createWorkShiftsService = async (data) => {
  const { workDate, shiftWage } = data;
  return sequelize.transaction(async (t) => {
    const existed = await WorkShift.findOne({
      where: { workDate },
      transaction: t,
    });

    if (existed) {
      throw new BadRequestError("Ngày này đã được tạo ca làm việc");
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

    const createdShifts = await WorkShift.bulkCreate(shifts, {
      transaction: t,
    });

    return createdShifts;
  });
};

const getAllWorkShiftsService = async (data) => {
  const { page, limit, workDate } = data;
  const p = page ?? 1;
  const l = limit ?? 10;
  const offset = (p - 1) * l;

  const whereCondition = workDate ? { workDate } : {};

  const { rows, count } = await WorkShift.findAndCountAll({
    where: whereCondition,
    order: [
      ["workDate", "DESC"],
      ["startTime", "ASC"],
    ],
    limit: l,
    offset,
  });

  return {
    workShifts: rows,
    pagination: {
      total: count,
      page: p,
      limit: l,
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
