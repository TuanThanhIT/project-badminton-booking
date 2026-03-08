import { Court, CourtPrice, CourtSchedule } from "../../models/index.js";
import { Op } from "sequelize";
import ConflictError from "../../errors/ConflictError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import sequelize from "../../config/db.js";
import { isTimeRangeValid } from "../../utils/timeUtils.js";

const createCourtService = async (data) => {
  const { name, location, thumbnailUrl } = data;
  return sequelize.transaction(async (t) => {
    const checkCourt = await Court.findOne({
      where: { name },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (checkCourt) {
      throw new ConflictError("Sân đã tồn tại");
    }
    return Court.create({ name, location, thumbnailUrl }, { transaction: t });
  });
};

const updateCourtService = async (data) => {
  const { courtId, updateData } = data;
  return sequelize.transaction(async (t) => {
    const court = await Court.findByPk(courtId, { transaction: t });
    if (!court) {
      throw new NotFoundError("Không tìm thấy sân");
    }
    await court.update(updateData, { transaction: t });
    return court;
  });
};

const getAllCourtsService = async () => {
  return Court.findAll({
    order: [["name", "ASC"]],
  });
};

const getCourtByIdService = async (data) => {
  const { courtId } = data;
  const court = await Court.findByPk(courtId);
  if (!court) {
    throw new NotFoundError("Không tìm thấy sân");
  }
  return court;
};

const createCourtPriceService = async (data) => {
  const { dayOfWeek, startTime, endTime, price, periodType } = data;
  return sequelize.transaction(async (t) => {
    // Validate nghiệp vụ: giờ bắt đầu < giờ kết thúc
    if (!isTimeRangeValid(startTime, endTime)) {
      throw new BadRequestError("Giờ kết thúc phải lớn hơn giờ bắt đầu");
    }
    const existed = await CourtPrice.findOne({
      where: {
        dayOfWeek,
        periodType,
        startTime: { [Op.lt]: endTime },
        endTime: { [Op.gt]: startTime },
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (existed) {
      throw new ConflictError("Khung giờ này đã có giá");
    }

    return CourtPrice.create(
      { dayOfWeek, startTime, endTime, price, periodType },
      { transaction: t },
    );
  });
};

const createWeeklySlotsService = async (data) => {
  const { startDate } = data;

  // Parse startDate
  const start = new Date(`${startDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    throw new BadRequestError("Không thể tạo lịch cho ngày trong quá khứ");
  }

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return sequelize.transaction(async (t) => {
    // Lấy danh sách sân
    const courts = await Court.findAll({
      attributes: ["id"],
      transaction: t,
    });

    if (!courts.length) {
      throw new BadRequestError("Hệ thống hiện chưa có sân nào");
    }

    const courtIds = courts.map((c) => c.id);

    // Các sân đã có lịch trong tuần
    const scheduledCourts = await CourtSchedule.findAll({
      attributes: ["courtId"],
      where: {
        courtId: { [Op.in]: courtIds },
        date: {
          [Op.between]: [
            start.toISOString().slice(0, 10),
            end.toISOString().slice(0, 10),
          ],
        },
      },
      group: ["courtId"],
      transaction: t,
    });

    const scheduledCourtIds = scheduledCourts.map((s) => s.courtId);

    const availableCourts = courts.filter(
      (c) => !scheduledCourtIds.includes(c.id),
    );

    if (!availableCourts.length) {
      throw new ConflictError("Tất cả các sân đã có lịch trong tuần này");
    }

    // Build slots
    const slots = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = date.toISOString().slice(0, 10);

      for (const court of availableCourts) {
        for (let hour = 7; hour < 22; hour++) {
          slots.push({
            date: dateStr,
            startTime: `${hour.toString().padStart(2, "0")}:00:00`,
            endTime: `${(hour + 1).toString().padStart(2, "0")}:00:00`,
            courtId: court.id,
            isAvailable: true,
          });
        }
      }
    }

    await CourtSchedule.bulkCreate(slots, { transaction: t });

    return {
      createdCourts: availableCourts.length,
      skippedCourts: scheduledCourtIds.length,
    };
  });
};

const courtService = {
  createCourtService,
  createCourtPriceService,
  createWeeklySlotsService,
  updateCourtService,
  getAllCourtsService,
  getCourtByIdService,
};
export default courtService;
