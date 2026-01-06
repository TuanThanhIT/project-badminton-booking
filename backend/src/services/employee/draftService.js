import { BAD_REQUEST, StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
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

const createDraftService = async (employeeId, nameCustomer) => {
  try {
    const draftBooking = await DraftBooking.findOne({
      where: { nameCustomer },
    });
    if (draftBooking) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Tên khách hàng đã tồn tại vui lòng tạo lại!"
      );
    }
    await DraftBooking.create({
      employeeId,
      nameCustomer,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getDraftsService = async () => {
  try {
    const draftBookings = await DraftBooking.findAll({
      where: { status: "Draft" },
      attributes: ["id", "nameCustomer", "note", "status", "total"],
    });
    return draftBookings;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const createAndUpdateDraftService = async (
  draftId,
  note,
  total,
  courtSchedules,
  beverages,
  products
) => {
  const transaction = await sequelize.transaction();
  try {
    const draftBooking = await DraftBooking.findByPk(draftId, { transaction });
    if (!draftBooking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Đơn tạm chưa được tạo!");
    }

    await draftBooking.update({ note, total }, { transaction });

    // Court schedules
    if (courtSchedules.length !== 0) {
      const cSchedules = courtSchedules.map((c) => ({ ...c, draftId }));
      await DraftBookingItem.bulkCreate(cSchedules, { transaction });

      const courtScheduleIds = courtSchedules.map((c) => c.courtScheduleId);

      await CourtSchedule.update(
        { isAvailable: false },
        { where: { id: { [Op.in]: courtScheduleIds } }, transaction }
      );
    }

    // Beverages
    await DraftBeverageItem.destroy({ where: { draftId }, transaction });
    if (beverages.length !== 0) {
      const bes = beverages.map((b) => ({ ...b, draftId }));
      await DraftBeverageItem.bulkCreate(bes, { transaction });
    }

    // Products
    await DraftProductItem.destroy({ where: { draftId }, transaction });
    if (products.length !== 0) {
      const prods = products.map((p) => ({ ...p, draftId }));
      await DraftProductItem.bulkCreate(prods, { transaction });
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    if (error instanceof ApiError) throw error;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const getDraftService = async (draftId) => {
  try {
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
      throw new ApiError(StatusCodes.NOT_FOUND, "Đơn tạm chưa được tạo!");
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
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const deleteDraftService = async (draftId) => {
  try {
    const draftBooking = await DraftBooking.findByPk(draftId);
    if (!draftBooking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Đơn tạm thời không tồn tại!");
    }

    if (draftBooking.status === "Completed") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Đơn tạm thời đã hoàn thành không thể xóa!"
      );
    }
    await draftBooking.destroy();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const draftService = {
  createDraftService,
  getDraftsService,
  createAndUpdateDraftService,
  getDraftService,
  deleteDraftService,
};
export default draftService;
