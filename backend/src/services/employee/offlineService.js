import { StatusCodes } from "http-status-codes";
import ApiError from "../../utils/ApiError.js";
import {
  DraftBeverageItem,
  DraftBooking,
  DraftBookingItem,
  DraftProductItem,
  OfflineBeverageItem,
  OfflineBooking,
  OfflineBookingItem,
  OfflineProductItem,
} from "../../models/index.js";

const createOfflineService = async (draftId, employeeId) => {
  const transaction = await sequelize.transaction();

  try {
    const draftBooking = await DraftBooking.findByPk(draftId, {
      attributes: ["id", "note", "total", "nameCustomer"],
      include: [
        {
          model: DraftBookingItem,
          as: "draftBookingItems",
          attributes: ["courtScheduleId", "price"],
        },
        {
          model: DraftBeverageItem,
          as: "draftBeverageItems",
          attributes: ["beverageId", "quantity", "subTotal"],
        },
        {
          model: DraftProductItem,
          as: "draftProductItems",
          attributes: ["productVarientId", "quantity", "subTotal"],
        },
      ],
      transaction,
    });

    if (!draftBooking) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Đơn tạm chưa được tạo!");
    }

    // Cập nhật trạng thái Draft → Completed
    await draftBooking.update({ status: "Completed" }, { transaction });

    // Tạo OfflineBooking
    const offlineBooking = await OfflineBooking.create(
      {
        draftId,
        employeeId,
      },
      { transaction }
    );

    // Flatten data
    const courtSchedules = draftBooking.draftBookingItems.map((item) => ({
      offlineBookingId: offlineBooking.id,
      courtScheduleId: item.courtScheduleId,
      price: item.price,
    }));

    const beverages = draftBooking.draftBeverageItems.map((item) => ({
      offlineBookingId: offlineBooking.id,
      beverageId: item.beverageId,
      quantity: item.quantity,
      subTotal: item.subTotal,
    }));

    const products = draftBooking.draftProductItems.map((item) => ({
      offlineBookingId: offlineBooking.id,
      productVarientId: item.productVarientId,
      quantity: item.quantity,
      subTotal: item.subTotal,
    }));

    // Insert all items
    if (courtSchedules.length > 0) {
      await OfflineBookingItem.bulkCreate(courtSchedules, { transaction });
    }

    if (beverages.length > 0) {
      await OfflineBeverageItem.bulkCreate(beverages, { transaction });
    }

    if (products.length > 0) {
      await OfflineProductItem.bulkCreate(products, { transaction });
    }

    // ---- Commit Transaction ----
    await transaction.commit();

    return {
      id: offlineBooking.id,
      total: draftBooking.total,
      nameCustomer: draftBooking.nameCustomer,
    };
  } catch (error) {
    await transaction.rollback();

    if (error instanceof ApiError) throw error;

    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};
const updateOfflineService = async (offlineBookingId, paymentMethod, total) => {
  try {
    const offlineBooking = await OfflineBooking.findByPk(offlineBookingId);
    if (!offlineBooking) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Đơn thanh toán trực tiếp chưa được tạo!"
      );
    }
    await offlineBooking.update({
      paymentMethod,
      grandTotal: total,
      paymentStatus: "Paid",
      paidAt: new Date(),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
  }
};

const offlineService = {
  createOfflineService,
  updateOfflineService,
};
export default offlineService;
