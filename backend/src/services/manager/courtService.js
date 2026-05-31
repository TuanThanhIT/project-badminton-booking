import { Court, BranchManager, CourtPrice } from "../../models/index.js";
//import Court from "../../models/court.js";

import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import sequelize from "../../config/db.js";

const createCourtService = async (managerId, data) => {
  const { courtName, location, thumbnailUrl } = data;

  // tìm chi nhánh manager quản lý
  const branchManager = await BranchManager.findOne({
    where: {
      managerId,
    },
  });

  if (!branchManager) {
    throw new NotFoundError("Manager chưa được gán chi nhánh");
  }

  // tạo sân
  const newCourt = await Court.create({
    branchId: branchManager.branchId,

    courtName,

    location,

    thumbnailUrl,
  });

  return newCourt;
};

const createCourtPriceService = async (managerId, data) => {
  const { dayOfWeek, startTime, endTime, price, periodType } = data;

  // tìm chi nhánh manager quản lý
  const branchManager = await BranchManager.findOne({
    where: {
      managerId,
    },
  });

  if (!branchManager) {
    throw new NotFoundError("Manager chưa được gán chi nhánh");
  }

  // tạo giá sân
  const newCourtPrice = await CourtPrice.create({
    branchId: branchManager.branchId,

    dayOfWeek,

    startTime,

    endTime,

    price,

    periodType,
  });

  return newCourtPrice;
};

const getCourtsService = async (managerId) => {
  const branchManager = await BranchManager.findOne({
    where: {
      managerId,
    },
  });

  if (!branchManager) {
    throw new NotFoundError("Manager chưa được gán chi nhánh");
  }

  const courts = await Court.findAll({
    where: {
      branchId: branchManager.branchId,
    },
    order: [["id", "DESC"]],
  });

  return courts;
};

const getCourtPricesService = async (managerId) => {
  const branchManager = await BranchManager.findOne({
    where: {
      managerId,
    },
  });

  if (!branchManager) {
    throw new NotFoundError("Manager chưa được gán chi nhánh");
  }

  const courtPrices = await CourtPrice.findAll({
    where: {
      branchId: branchManager.branchId,
    },

    order: [
      ["dayOfWeek", "ASC"],
      ["startTime", "ASC"],
    ],
  });

  return courtPrices;
};

const updateCourtService = async (managerId, courtId, data) => {
  const { courtName, location, thumbnailUrl } = data;

  const branchManager = await BranchManager.findOne({
    where: {
      managerId,
    },
  });

  if (!branchManager) {
    throw new NotFoundError("Manager chưa được gán chi nhánh");
  }

  const court = await Court.findOne({
    where: {
      id: courtId,
      branchId: branchManager.branchId,
    },
  });

  if (!court) {
    throw new NotFoundError("Không tìm thấy sân");
  }

  if (court.courtStatus === "CLOSED") {
    throw new BadRequestError("Sân đã bị xóa");
  }

  await court.update({
    courtName: courtName ?? court.courtName,

    location: location ?? court.location,

    thumbnailUrl: thumbnailUrl ?? court.thumbnailUrl,
  });

  return court;
};

const maintenanceCourtService = async (managerId, courtId) => {
  const branchManager = await BranchManager.findOne({
    where: {
      managerId,
    },
  });

  if (!branchManager) {
    throw new NotFoundError("Manager chưa được gán chi nhánh");
  }

  const court = await Court.findOne({
    where: {
      id: courtId,
      branchId: branchManager.branchId,
    },
  });

  if (!court) {
    throw new NotFoundError("Không tìm thấy sân");
  }

  await court.update({
    courtStatus: "MAINTENANCE",
  });

  return court;
};

const closeCourtService = async (managerId, courtId) => {
  const branchManager = await BranchManager.findOne({
    where: {
      managerId,
    },
  });

  if (!branchManager) {
    throw new NotFoundError("Manager chưa được gán chi nhánh");
  }

  const court = await Court.findOne({
    where: {
      id: courtId,
      branchId: branchManager.branchId,
    },
  });

  if (!court) {
    throw new NotFoundError("Không tìm thấy sân");
  }

  await court.update({
    courtStatus: "CLOSED",
  });

  return court;
};

const courtService = {
  createCourtService,
  createCourtPriceService,
  getCourtsService,
  getCourtPricesService,
  updateCourtService,
  maintenanceCourtService,
  closeCourtService,
};

export default courtService;
