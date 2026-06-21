"use strict";

/**
 * Bulk AI training data — bookings + orders across ALL branches.
 * Marker: [DEMO-SEED-3M] AI-BULK-TRAIN
 *
 * Targets:
 * - Booking rec (LightGBM): users with fixed branch/hour/weekday habits per branch
 * - Admin occupancy: peak 18–21h vs low 7–8h per branch (last 30 days)
 * - Product co-occurrence: PAID multi-item baskets (vợt + cước + balo)
 * - Product user ML: persona purchase histories per branch
 */

const u = require("./demo-3m-utils.cjs");
const { getBase, priceFor } = require("./demo-3m-phases.cjs");

const BULK_TAG = `${u.MARKER} AI-BULK-TRAIN`;
const PAY_PREFIX = "AI-BULK-PAY-";

const BRANCH_HABITS = [
  { hour: 19, duration: 1, weekdays: [1, 3, 5] },
  { hour: 6, duration: 1, weekdays: [6, 0] },
  { hour: 20, duration: 1, weekdays: [2, 4] },
  { hour: 17, duration: 2, weekdays: [1, 5] },
  { hour: 18, duration: 1, weekdays: [0, 3] },
];

const PEAK_HOURS = [18, 19, 20, 21];
const LOW_HOURS = [7, 8];

const today = () => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
};

const daysAgo = (n) => u.addDays(today(), -n);

const deleteBulkPayments = async (qi, transaction) => {
  const payments = await qi.sequelize.query(
    "SELECT id FROM Payments WHERE externalId LIKE :prefix",
    {
      type: require("sequelize").QueryTypes.SELECT,
      replacements: { prefix: `${PAY_PREFIX}%` },
      transaction,
    },
  );
  const ids = payments.map((r) => Number(r.id));
  if (ids.length) await u.del(qi, "WalletTransactions", { paymentId: ids }, transaction);
  if (ids.length) await u.del(qi, "Payments", { id: ids }, transaction);
};

const deleteBulkOrders = async (qi, Sequelize, transaction) => {
  await deleteBulkPayments(qi, transaction);
  const groups = await u.q(
    qi,
    Sequelize,
    "SELECT id FROM OrderGroups WHERE note LIKE :note",
    { note: `${BULK_TAG}%` },
    transaction,
  );
  const groupIds = groups.map((r) => Number(r.id));
  if (!groupIds.length) return;
  const orders = await u.q(
    qi,
    Sequelize,
    "SELECT id FROM Orders WHERE orderGroupId IN (:ids)",
    { ids: groupIds },
    transaction,
  );
  const orderIds = orders.map((r) => Number(r.id));
  if (orderIds.length) {
    await u.del(qi, "OrderShippingLogs", { orderId: orderIds }, transaction);
    await u.del(qi, "OrderDetails", { orderId: orderIds }, transaction);
    await u.del(qi, "Orders", { id: orderIds }, transaction);
  }
  await u.del(qi, "OrderGroups", { id: groupIds }, transaction);
};

const deleteBulkBookings = async (qi, Sequelize, transaction) => {
  const rows = await u.q(
    qi,
    Sequelize,
    "SELECT id FROM Bookings WHERE note LIKE :note",
    { note: `${BULK_TAG}%` },
    transaction,
  );
  const ids = rows.map((r) => Number(r.id));
  if (!ids.length) return;
  await u.del(qi, "BookingDetails", { bookingId: ids }, transaction);
  await u.del(qi, "Bookings", { id: ids }, transaction);
};

const findProductVariant = async (qi, Sequelize, transaction, nameLike, branchId) => {
  const rows = await u.q(
    qi,
    Sequelize,
    `
      SELECT pv.id AS variantId, pv.productId, pv.price, pv.discount, pv.sku, pv.color, pv.size,
             p.productName, p.thumbnailUrl, p.categoryId
      FROM Products p
      INNER JOIN ProductVariants pv ON pv.productId = p.id
      INNER JOIN VariantStocks vs ON vs.variantId = pv.id AND vs.branchId = :branchId
      WHERE p.productName LIKE :nameLike AND vs.stock > 0
      ORDER BY pv.id
      LIMIT 1
    `,
    { nameLike, branchId },
    transaction,
  );
  return rows[0] || null;
};

const buildVariantLine = (variant, quantity = 1) => {
  const unitPrice = u.money(
    Number(variant.price) * (1 - Number(variant.discount || 0) / 100),
  );
  return {
    variantId: variant.variantId,
    productId: Number(variant.productId),
    productName: variant.productName,
    categoryId: Number(variant.categoryId || 0),
    variantInfo: [variant.sku, variant.color, variant.size].filter(Boolean).join(" / "),
    quantity,
    unitPrice,
    subTotal: unitPrice * quantity,
  };
};

const insertBulkPaidOrder = async (
  qi,
  Sequelize,
  transaction,
  { user, branch, variants, groupNote, createdAt, paySeq },
) => {
  if (!variants.length) return null;

  const subtotal = variants.reduce((sum, v) => sum + Number(v.subTotal || 0), 0);
  const shippingFee = 30000;
  const finalAmount = subtotal + shippingFee;
  const created = createdAt || u.dateTime(daysAgo(u.int(1, 60)), u.publicHour(), u.int(0, 59));

  await u.insert(
    qi,
    "OrderGroups",
    [
      {
        totalAmount: subtotal,
        totalShippingFee: shippingFee,
        discountId: null,
        discountAmount: 0,
        isDiscountApplied: false,
        finalAmount,
        status: "PAID",
        note: groupNote,
        userId: user.id,
        createdAt: created,
        updatedAt: u.addMinutes(created, 30),
      },
    ],
    transaction,
  );

  const [group] = await u.q(
    qi,
    Sequelize,
    "SELECT id FROM OrderGroups WHERE note = :note ORDER BY id DESC LIMIT 1",
    { note: groupNote },
    transaction,
  );
  if (!group) return null;

  const orderMarker = `${groupNote}-ORD`;
  await u.insert(
    qi,
    "Orders",
    [
      {
        orderStatus: "COMPLETED",
        previousOrderStatus: null,
        subtotal,
        shippingFee,
        totalAmount: finalAmount,
        shippingName: user.fullName || user.username,
        shippingPhone: user.phoneNumber || "0977000000",
        shippingAddress: u.addresses[0].address,
        shippingDistrictId: u.addresses[0].districtId,
        shippingWardCode: u.addresses[0].wardCode,
        shippingWeight: 1.2,
        shippingServiceId: 53320,
        shippingFeeReal: shippingFee,
        shippingStatus: "DELIVERED",
        deliveredAt: u.addDays(created, 3),
        trackingCode: orderMarker,
        shippingOrderCode: `AI-BULK-GHN-${u.pad(paySeq, 6)}`,
        estimatedDelivery: u.addDays(created, 4),
        branchId: branch.id,
        orderGroupId: group.id,
        cancelledBy: null,
        cancelReason: null,
        cancelRequestedAt: null,
        cancelHandledAt: null,
        cancelRejectReason: null,
        returnReason: null,
        returnRequestedAt: null,
        returnHandledAt: null,
        cancelledAt: null,
        returnedAt: null,
        createdAt: created,
        updatedAt: u.addDays(created, 1),
      },
    ],
    transaction,
  );

  const [order] = await u.q(
    qi,
    Sequelize,
    "SELECT id FROM Orders WHERE trackingCode = :marker LIMIT 1",
    { marker: orderMarker },
    transaction,
  );
  if (!order) return null;

  await u.insert(
    qi,
    "OrderDetails",
    variants.map((v) => ({
      quantity: v.quantity,
      unitPrice: v.unitPrice,
      subTotal: v.subTotal,
      productName: v.productName,
      variantInfo: v.variantInfo,
      orderId: order.id,
      variantId: v.variantId,
    })),
    transaction,
  );

  await u.insert(
    qi,
    "Payments",
    [
      {
        paymentAmount: finalAmount,
        paymentMethod: "VNPAY",
        paymentStatus: "PAID",
        transId: `${PAY_PREFIX}TXN-${u.pad(paySeq, 6)}`,
        externalId: `${PAY_PREFIX}${u.pad(paySeq, 6)}`,
        paidAt: u.addMinutes(created, 20),
        refundAmount: null,
        refundAt: null,
        targetPaymentType: "ORDER",
        targetPaymentId: group.id,
      },
    ],
    transaction,
  );

  return { groupId: group.id, productIds: variants.map((v) => v.productId) };
};

const seedBulkBookings = async (qi, Sequelize) =>
  u.phaseTransaction(qi, async (transaction) => {
    await deleteBulkBookings(qi, Sequelize, transaction);

    const base = await getBase(qi, Sequelize, transaction);
    const users = (await u.getDemoUsers(qi, Sequelize, transaction)).filter(
      (row) => row.roleName === "USER",
    );
    if (!users.length || !base.branches.length) {
      return { bookings: 0, reason: "no_users_or_branches" };
    }

    const courtsByBranch = base.courts.reduce((acc, court) => {
      (acc[court.branchId] = acc[court.branchId] || []).push(court);
      return acc;
    }, {});

    const occupied = new Set();
    const bookings = [];
    const detailsMeta = [];
    let seq = 0;

    const reserveSlot = (courtId, playDate, hour) => {
      const key = `${courtId}-${u.dateOnly(playDate)}-${hour}`;
      if (occupied.has(key)) return false;
      occupied.add(key);
      return true;
    };

    const pushBooking = ({
      user,
      branch,
      court,
      playDate,
      hour,
      duration,
      suffix,
      status = "COMPLETED",
    }) => {
      if (!reserveSlot(court.id, playDate, hour)) return false;
      seq += 1;
      const marker = `BULK-${suffix}-${u.pad(seq, 5)}`;
      const price = priceFor(base.prices, branch.id, playDate, hour, hour + duration);
      const createdAt = u.addDays(
        u.dateTime(playDate, Math.max(6, hour - u.int(2, 6)), u.int(0, 45)),
        -u.int(1, 4),
      );
      bookings.push({
        bookingStatus: status,
        previousBookingStatus: null,
        totalAmount: price,
        branchId: branch.id,
        userId: user.id,
        discountId: null,
        note: `${BULK_TAG} ${marker}`,
        cancelledBy: null,
        cancelReason: null,
        cancelRejectReason: null,
        cancelRequestedAt: null,
        cancelHandledAt: null,
        cancelledAt: null,
        createdAt,
        updatedAt: u.addMinutes(createdAt, 50),
      });
      detailsMeta.push({
        marker,
        courtId: court.id,
        playDate: u.dateOnly(playDate),
        startTime: u.time(hour),
        endTime: u.time(hour + duration),
        price,
      });
      return true;
    };

    // 1) Per-branch user habits — 5 users × branch, 14 weeks
    base.branches.forEach((branch, branchIdx) => {
      const courts = courtsByBranch[branch.id] || [];
      if (!courts.length) return;
      const habit = BRANCH_HABITS[branchIdx % BRANCH_HABITS.length];
      const branchUsers = users.slice(branchIdx * 5, branchIdx * 5 + 5);
      if (!branchUsers.length) return;

      branchUsers.forEach((user, userIdx) => {
        const court = courts[userIdx % courts.length];
        for (let w = 0; w < 14; w += 1) {
          const weekday = habit.weekdays[w % habit.weekdays.length];
          const anchor = daysAgo(w * 7 + 2);
          const d = new Date(anchor);
          const diff = (d.getDay() - weekday + 7) % 7;
          d.setDate(d.getDate() - diff);
          if (d > today()) continue;

          pushBooking({
            user,
            branch,
            court,
            playDate: d,
            hour: habit.hour,
            duration: habit.duration,
            suffix: `HAB-B${branch.id}-U${userIdx + 1}`,
          });
        }
      });
    });

    // 2) Occupancy skew — mỗi chi nhánh: nhiều 18–21h, ít 7–8h (28 ngày gần đây)
    base.branches.forEach((branch, branchIdx) => {
      const courts = courtsByBranch[branch.id] || [];
      if (!courts.length) return;

      for (let day = 1; day <= 28; day += 1) {
        for (const hour of PEAK_HOURS) {
          const playDate = daysAgo(day);
          const user = users[(branchIdx * 7 + day + hour) % users.length];
          const court = courts[(day + hour) % courts.length];
          pushBooking({
            user,
            branch,
            court,
            playDate,
            hour,
            duration: 1,
            suffix: `OCC-PEAK-B${branch.id}`,
          });
        }
      }

      for (let day = 2; day <= 28; day += 4) {
        for (const hour of LOW_HOURS) {
          const playDate = daysAgo(day);
          const user = users[(branchIdx * 3 + day) % users.length];
          const court = courts[day % courts.length];
          pushBooking({
            user,
            branch,
            court,
            playDate,
            hour,
            duration: 1,
            suffix: `OCC-LOW-B${branch.id}`,
          });
        }
      }
    });

    // 3) Churn risk — 2 user / chi nhánh, lần cuối > 25 ngày
    base.branches.forEach((branch, branchIdx) => {
      const courts = courtsByBranch[branch.id] || [];
      if (!courts.length) return;
      const churnUsers = users.slice(branchIdx * 5 + 3, branchIdx * 5 + 5);
      churnUsers.forEach((user, idx) => {
        const court = courts[idx % courts.length];
        const gaps = [75, 45, 28 + idx * 2];
        gaps.forEach((daysBack, i) => {
          pushBooking({
            user,
            branch,
            court,
            playDate: daysAgo(daysBack),
            hour: 19,
            duration: 1,
            suffix: `CHURN-B${branch.id}-${idx + 1}-${i + 1}`,
          });
        });
      });
    });

    await u.insert(qi, "Bookings", bookings, transaction);
    const dbBookings = await u.q(
      qi,
      Sequelize,
      "SELECT id, note FROM Bookings WHERE note LIKE :note",
      { note: `${BULK_TAG}%` },
      transaction,
    );
    const byMarker = new Map(
      dbBookings.map((b) => {
        const parts = String(b.note).trim().split(/\s+/);
        return [parts[parts.length - 1], b];
      }),
    );
    await u.insert(
      qi,
      "BookingDetails",
      detailsMeta
        .map((d) => ({
          bookingId: byMarker.get(d.marker)?.id,
          monthlyBookingId: null,
          courtId: d.courtId,
          playDate: d.playDate,
          startTime: d.startTime,
          endTime: d.endTime,
          price: d.price,
        }))
        .filter((d) => d.bookingId),
      transaction,
    );

    return { bookings: bookings.length, branches: base.branches.length };
  });

const seedBulkOrders = async (qi, Sequelize) =>
  u.phaseTransaction(qi, async (transaction) => {
    await deleteBulkOrders(qi, Sequelize, transaction);

    const base = await getBase(qi, Sequelize, transaction);
    const users = (await u.getDemoUsers(qi, Sequelize, transaction)).filter(
      (row) => row.roleName === "USER",
    );
    if (!users.length || !base.branches.length) {
      return { orders: 0, reason: "no_users_or_branches" };
    }

    let paySeq = 0;
    const stats = { beginnerKit: 0, shoeKit: 0, persona: 0, total: 0 };

    const resolveBranchProducts = async (branchId) => {
      const [racket, shuttle, bag, shoes] = await Promise.all([
        findProductVariant(qi, Sequelize, transaction, "%Nanoflare Skill%Vợt%", branchId),
        findProductVariant(qi, Sequelize, transaction, "%Cước đan vợt%", branchId),
        findProductVariant(qi, Sequelize, transaction, "%Balo cầu lông Yonex%", branchId),
        findProductVariant(qi, Sequelize, transaction, "%Giày cầu lông Yonex%", branchId),
      ]);
      return { racket, shuttle, bag, shoes };
    };

    const PERSONAS = [
      { suffix: "RACKET", pick: (p) => (p.racket ? [p.racket] : []), repeats: 8 },
      { suffix: "COMBO", pick: (p) => [p.racket, p.shuttle].filter(Boolean), repeats: 10 },
      { suffix: "BAG", pick: (p) => (p.bag ? [p.bag] : []), repeats: 6 },
      { suffix: "SHOES", pick: (p) => (p.shoes ? [p.shoes] : []), repeats: 6 },
      { suffix: "MIXED", pick: (p) => [p.shuttle, p.bag].filter(Boolean), repeats: 5 },
    ];

    for (const branch of base.branches) {
      const products = await resolveBranchProducts(branch.id);
      const kit = [products.racket, products.shuttle, products.bag].filter(Boolean);
      if (kit.length >= 2) {
        for (let i = 0; i < 24; i += 1) {
          paySeq += 1;
          const buyer = users[(Number(branch.id) * 11 + i) % users.length];
          const note = `${BULK_TAG} KIT-B${branch.id}-${u.pad(i + 1, 3)}`;
          const ok = await insertBulkPaidOrder(qi, Sequelize, transaction, {
            user: buyer,
            branch,
            variants: kit.map((v) => buildVariantLine(v, 1)),
            groupNote: note,
            createdAt: u.dateTime(daysAgo(u.int(2, 90)), u.publicHour(), 0),
            paySeq,
          });
          if (ok) {
            stats.beginnerKit += 1;
            stats.total += 1;
          }
        }
      }

      const shoeKit = [products.shoes, products.bag].filter(Boolean);
      if (shoeKit.length >= 2) {
        for (let i = 0; i < 12; i += 1) {
          paySeq += 1;
          const buyer = users[(Number(branch.id) * 13 + i + 20) % users.length];
          const note = `${BULK_TAG} SHOE-B${branch.id}-${u.pad(i + 1, 3)}`;
          const ok = await insertBulkPaidOrder(qi, Sequelize, transaction, {
            user: buyer,
            branch,
            variants: shoeKit.map((v) => buildVariantLine(v, 1)),
            groupNote: note,
            createdAt: u.dateTime(daysAgo(u.int(2, 75)), u.publicHour(), 15),
            paySeq,
          });
          if (ok) {
            stats.shoeKit += 1;
            stats.total += 1;
          }
        }
      }

      const branchUsers = users.slice(
        (Number(branch.id) - 1) * 5,
        (Number(branch.id) - 1) * 5 + 5,
      );
      for (let userIdx = 0; userIdx < branchUsers.length; userIdx += 1) {
        const user = branchUsers[userIdx];
        const persona = PERSONAS[userIdx % PERSONAS.length];
        const lines = persona.pick(products);
        if (!lines.length) continue;

        for (let i = 0; i < persona.repeats; i += 1) {
          paySeq += 1;
          const note = `${BULK_TAG} PERSONA-B${branch.id}-${persona.suffix}-${u.pad(userIdx + 1, 2)}-${u.pad(i + 1, 2)}`;
          const ok = await insertBulkPaidOrder(qi, Sequelize, transaction, {
            user,
            branch,
            variants: lines.map((v) => buildVariantLine(v, 1)),
            groupNote: note,
            createdAt: u.dateTime(daysAgo(u.int(5, 100) + i * 3), u.int(9, 20), 0),
            paySeq,
          });
          if (ok) {
            stats.persona += 1;
            stats.total += 1;
          }
        }
      }
    }

    return stats;
  });

const downBulkBookings = async (qi, Sequelize) =>
  u.phaseTransaction(qi, async (transaction) => {
    await deleteBulkBookings(qi, Sequelize, transaction);
  });

const downBulkOrders = async (qi, Sequelize) =>
  u.phaseTransaction(qi, async (transaction) => {
    await deleteBulkOrders(qi, Sequelize, transaction);
  });

const seedAiBulkTrainingData = async (qi, Sequelize) => {
  const bookingResult = await seedBulkBookings(qi, Sequelize);
  const orderResult = await seedBulkOrders(qi, Sequelize);
  return { bookingResult, orderResult };
};

const downAiBulkTrainingData = async (qi, Sequelize) => {
  await downBulkOrders(qi, Sequelize);
  await downBulkBookings(qi, Sequelize);
};

module.exports = {
  BULK_TAG,
  seedAiBulkTrainingData,
  downAiBulkTrainingData,
  seedBulkBookings,
  seedBulkOrders,
  downBulkBookings,
  downBulkOrders,
};
