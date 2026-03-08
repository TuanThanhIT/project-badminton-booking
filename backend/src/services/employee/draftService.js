import {
  Beverage,
  Court,
  CourtSchedule,
  DraftBeverageItem,
  DraftBooking,
  DraftBookingItem,
  DraftProductItem,
  Product,
  ProductVarient,
} from "../../models/index.js";
import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import ConflictError from "../../errors/ConflictError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";
import { DRAFT_BOOKING_STATUS } from "../../constants/draftBookingConstant.js";

const createDraftService = async (data) => {
  const { employeeId, nameCustomer } = data;
  const draftBooking = await DraftBooking.findOne({
    where: { nameCustomer },
  });
  if (draftBooking) {
    throw new ConflictError("Tên khách hàng đã tồn tại vui lòng tạo lại");
  }
  await DraftBooking.create({
    employeeId,
    nameCustomer,
  });
};

const getDraftsService = async () => {
  const draftBookings = await DraftBooking.findAll({
    where: { status: "Draft" },
    attributes: ["id", "nameCustomer", "note", "status", "total"],
  });
  return draftBookings;
};

const createAndUpdateDraftService = async (data) => {
  const { draftId, note, total, courtSchedules, beverages, products } = data;
  return sequelize.transaction(async (t) => {
    const draftBooking = await DraftBooking.findByPk(draftId, {
      transaction: t,
    });
    if (!draftBooking) {
      throw new NotFoundError("Đơn tạm chưa được tạo");
    }

    await draftBooking.update({ note, total }, { transaction: t });

    // Court schedules
    if (courtSchedules.length !== 0) {
      const cSchedules = courtSchedules.map((c) => ({ ...c, draftId }));
      // NÊN LÀM
      await DraftBookingItem.bulkCreate(cSchedules, { transaction: t });

      const courtScheduleIds = courtSchedules.map((c) => c.courtScheduleId);

      await CourtSchedule.update(
        { isAvailable: false },
        { where: { id: { [Op.in]: courtScheduleIds } }, transaction: t },
      );
    }

    // Beverages
    await DraftBeverageItem.destroy({ where: { draftId }, transaction: t });
    if (beverages.length !== 0) {
      const bes = beverages.map((b) => ({ ...b, draftId }));
      await DraftBeverageItem.bulkCreate(bes, { transaction: t });
    }

    // Products
    await DraftProductItem.destroy({ where: { draftId }, transaction: t });
    if (products.length !== 0) {
      const prods = products.map((p) => ({ ...p, draftId }));
      await DraftProductItem.bulkCreate(prods, { transaction: t });
    }
  });
};

const getDraftService = async (data) => {
  const { draftId } = data;
  const draftBooking = await DraftBooking.findByPk(draftId, {
    attributes: ["id", "note", "total"],
    include: [
      {
        model: DraftBookingItem,
        as: "draftBookingItems",
        attributes: ["courtScheduleId", "price"],
        include: [
          {
            model: CourtSchedule,
            as: "courtSchedule",
            attributes: ["id", "startTime", "endTime"],
            include: [
              {
                model: Court,
                as: "court",
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      },
      {
        model: DraftBeverageItem,
        as: "draftBeverageItems",
        attributes: ["beverageId", "quantity", "subTotal"],
        include: [
          {
            model: Beverage,
            as: "beverage",
            attributes: ["id", "name", "price"],
          },
        ],
      },
      {
        model: DraftProductItem,
        as: "draftProductItems",
        attributes: ["productVarientId", "quantity", "subTotal"],
        include: [
          {
            model: ProductVarient,
            as: "productVarient",
            attributes: ["id", "price"],
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["id", "productName"],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!draftBooking) {
    throw new NotFoundError("Đơn tạm chưa được tạo");
  }

  // --- Flatten data ---
  const courtSchedules = draftBooking.draftBookingItems.map((item) => ({
    courtScheduleId: item.courtScheduleId,
    courtName: item.courtSchedule?.court?.name || "",
    startTime: item.courtSchedule?.startTime,
    endTime: item.courtSchedule?.endTime,
    price: item.price,
  }));

  const beverages = draftBooking.draftBeverageItems.map((item) => ({
    beverageId: item.beverageId,
    name: item.beverage?.name || "",
    price: item.beverage?.price || 0,
    quantity: item.quantity,
    subTotal: item.subTotal,
  }));

  const products = draftBooking.draftProductItems.map((item) => ({
    productVarientId: item.productVarientId,
    productName: item.productVarient?.product?.productName || "",
    price: item.productVarient?.price || 0,
    quantity: item.quantity,
    subTotal: item.subTotal,
  }));

  return {
    id: draftBooking.id,
    note: draftBooking.note,
    total: draftBooking.total,
    courtSchedules,
    beverages,
    products,
  };
};

const deleteDraftService = async (data) => {
  const { draftId } = data;
  const draftBooking = await DraftBooking.findByPk(draftId);
  if (!draftBooking) {
    throw new NotFoundError("Đơn tạm thời không tồn tại");
  }

  if (draftBooking.status === DRAFT_BOOKING_STATUS.COMPLETED) {
    throw new BadRequestError("Đơn tạm thời đã hoàn thành không thể xóa");
  }
  await draftBooking.destroy();
};

const draftService = {
  createDraftService,
  getDraftsService,
  createAndUpdateDraftService,
  getDraftService,
  deleteDraftService,
};
export default draftService;
