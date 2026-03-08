import {
  Beverage,
  DraftBeverageItem,
  DraftBooking,
  DraftBookingItem,
  DraftProductItem,
  OfflineBeverageItem,
  OfflineBooking,
  OfflineBookingItem,
  OfflineProductItem,
  ProductVarient,
} from "../../models/index.js";
import sequelize from "../../config/db.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { DRAFT_BOOKING_STATUS } from "../../constants/draftBookingConstant.js";
import { PAYMENT_STATUS } from "../../constants/paymentConstant.js";

const createOfflineService = async (data) => {
  const { draftId, employeeId } = data;
  return sequelize.transaction(async (t) => {
    const draftBooking = await DraftBooking.findByPk(
      draftId,
      {
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
      },
      { transaction: t },
    );

    if (!draftBooking) {
      throw new NotFoundError("Đơn tạm chưa được tạo");
    }

    // Cập nhật trạng thái Draft → Completed
    await draftBooking.update(
      { status: DRAFT_BOOKING_STATUS.COMPLETED },
      { transaction: t },
    );

    // Tạo OfflineBooking
    const offlineBooking = await OfflineBooking.create(
      {
        draftId,
        employeeId,
      },
      { transaction: t },
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
      await OfflineBookingItem.bulkCreate(courtSchedules, { transaction: t });
    }

    if (beverages.length > 0) {
      await OfflineBeverageItem.bulkCreate(beverages, { transaction: t });
    }

    if (products.length > 0) {
      await OfflineProductItem.bulkCreate(products, { transaction: t });
    }

    return {
      id: offlineBooking.id,
      total: draftBooking.total,
      nameCustomer: draftBooking.nameCustomer,
    };
  });
};

const updateOfflineService = async (data) => {
  const { offlineBookingId, paymentMethod, total } = data;
  return sequelize.transaction(async (t) => {
    const offlineBooking = await OfflineBooking.findByPk(offlineBookingId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!offlineBooking) {
      throw new NotFoundError("Đơn thanh toán trực tiếp chưa được tạo");
    }

    await offlineBooking.update(
      {
        paymentMethod,
        grandTotal: total,
        paymentStatus: PAYMENT_STATUS.PAID,
        paidAt: new Date(),
      },
      { transaction: t },
    );

    /* ========= TRỪ STOCK SẢN PHẨM ========= */
    const detailProducts = await OfflineProductItem.findAll({
      where: { offlineBookingId: offlineBooking.id },
      attributes: ["productVarientId", "quantity"],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (detailProducts.length > 0) {
      await Promise.all(
        detailProducts.map(({ productVarientId, quantity }) =>
          ProductVarient.increment(
            { stock: -quantity },
            {
              where: { id: productVarientId },
              transaction: t,
              lock: t.LOCK.UPDATE,
            },
          ),
        ),
      );
    }

    /* ========= TRỪ STOCK NƯỚC ========= */
    const detailBeverages = await OfflineBeverageItem.findAll({
      where: { offlineBookingId: offlineBooking.id },
      attributes: ["beverageId", "quantity"],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (detailBeverages.length > 0) {
      await Promise.all(
        detailBeverages.map(({ beverageId, quantity }) =>
          Beverage.increment(
            { stock: -quantity },
            {
              where: { id: beverageId },
              transaction: t,
              lock: t.LOCK.UPDATE,
            },
          ),
        ),
      );
    }

    return offlineBooking;
  });
};

const offlineService = {
  createOfflineService,
  updateOfflineService,
};
export default offlineService;
