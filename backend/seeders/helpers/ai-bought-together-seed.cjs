"use strict";

/**
 * Seed đơn PAID có combo mua kèm hợp lý cho gợi ý "Thường được mua kèm".
 * Marker: [DEMO-SEED-3M] AI-BUNDLE-COOCUR
 *
 * Combo chính:
 * - Vợt + Vớ (+ Cước / Quấn cán / Balo)
 * - Giày + Vớ
 * - Vợt + Quả cầu
 */

const u = require("./demo-3m-utils.cjs");
const { getBase } = require("./demo-3m-phases.cjs");

const BUNDLE_TAG = `${u.MARKER} AI-BUNDLE-COOCUR`;
const PAY_PREFIX = "AI-BUNDLE-PAY-";

const today = () => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
};

const daysAgo = (n) => u.addDays(today(), -n);

/** categoryId theo DB thực tế */
const CAT = {
  RACKET_YONEX: [1],
  RACKET_ANY: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  SOCKS: [69],
  STRING: [70],
  SHUTTLE: [71],
  GRIP: [76],
  BAG: [59],
  SHOES_YONEX: [11],
  SHIRT_YONEX: [21],
  PANTS_YONEX: [39],
};

const BUNDLE_PLANS = [
  {
    code: "RACKET-SOCKS",
    label: "Vợt + Vớ",
    categories: [CAT.RACKET_YONEX, CAT.SOCKS],
    quantities: [1, 2],
    repeatsPerBranch: 5,
  },
  {
    code: "RACKET-SOCKS-STRING",
    label: "Vợt + Vớ + Cước",
    categories: [CAT.RACKET_YONEX, CAT.SOCKS, CAT.STRING],
    quantities: [1, 2, 1],
    repeatsPerBranch: 4,
  },
  {
    code: "RACKET-STRING-GRIP",
    label: "Vợt + Cước + Quấn cán",
    categories: [CAT.RACKET_YONEX, CAT.STRING, CAT.GRIP],
    quantities: [1, 1, 2],
    repeatsPerBranch: 4,
  },
  {
    code: "RACKET-BAG-STRING",
    label: "Vợt + Balo + Cước",
    categories: [CAT.RACKET_YONEX, CAT.BAG, CAT.STRING],
    quantities: [1, 1, 1],
    repeatsPerBranch: 4,
  },
  {
    code: "RACKET-SHUTTLE",
    label: "Vợt + Quả cầu",
    categories: [CAT.RACKET_YONEX, CAT.SHUTTLE],
    quantities: [1, 1],
    repeatsPerBranch: 4,
  },
  {
    code: "RACKET-SOCKS-GRIP",
    label: "Vợt + Vớ + Quấn cán",
    categories: [CAT.RACKET_YONEX, CAT.SOCKS, CAT.GRIP],
    quantities: [1, 2, 2],
    repeatsPerBranch: 3,
  },
  {
    code: "SHOES-SOCKS",
    label: "Giày + Vớ",
    categories: [CAT.SHOES_YONEX, CAT.SOCKS],
    quantities: [1, 2],
    repeatsPerBranch: 5,
  },
  {
    code: "SHOES-SOCKS-BAG",
    label: "Giày + Vớ + Balo",
    categories: [CAT.SHOES_YONEX, CAT.SOCKS, CAT.BAG],
    quantities: [1, 2, 1],
    repeatsPerBranch: 3,
  },
  {
    code: "SHIRT-PANTS",
    label: "Áo + Quần cầu lông",
    categories: [CAT.SHIRT_YONEX, CAT.PANTS_YONEX],
    quantities: [1, 1],
    repeatsPerBranch: 5,
  },
  {
    code: "OUTFIT-SOCKS",
    label: "Áo + Quần + Vớ",
    categories: [CAT.SHIRT_YONEX, CAT.PANTS_YONEX, CAT.SOCKS],
    quantities: [1, 1, 2],
    repeatsPerBranch: 4,
  },
  {
    code: "OUTFIT-BAG",
    label: "Áo + Quần + Balo",
    categories: [CAT.SHIRT_YONEX, CAT.PANTS_YONEX, CAT.BAG],
    quantities: [1, 1, 1],
    repeatsPerBranch: 3,
  },
  {
    code: "RACKET-OUTFIT",
    label: "Vợt + Áo + Quần",
    categories: [CAT.RACKET_YONEX, CAT.SHIRT_YONEX, CAT.PANTS_YONEX],
    quantities: [1, 1, 1],
    repeatsPerBranch: 3,
  },
  {
    code: "SHOES-OUTFIT",
    label: "Giày + Áo + Quần",
    categories: [CAT.SHOES_YONEX, CAT.SHIRT_YONEX, CAT.PANTS_YONEX],
    quantities: [1, 1, 1],
    repeatsPerBranch: 3,
  },
];

const findVariantByCategories = async (
  qi,
  Sequelize,
  transaction,
  categoryIds,
  branchId,
  offset = 0,
) => {
  const rows = await u.q(
    qi,
    Sequelize,
    `
      SELECT pv.id AS variantId, pv.productId, pv.price, pv.discount, pv.sku, pv.color, pv.size,
             p.productName, p.thumbnailUrl, p.categoryId
      FROM Products p
      INNER JOIN ProductVariants pv ON pv.productId = p.id
      INNER JOIN VariantStocks vs ON vs.variantId = pv.id AND vs.branchId = :branchId
      WHERE p.categoryId IN (:categoryIds) AND vs.stock > 0
      ORDER BY pv.id
      LIMIT 1 OFFSET :offset
    `,
    { categoryIds, branchId, offset },
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

const deleteBundleOrders = async (qi, Sequelize, transaction) => {
  const payments = await qi.sequelize.query(
    "SELECT id FROM Payments WHERE externalId LIKE :prefix",
    {
      type: require("sequelize").QueryTypes.SELECT,
      replacements: { prefix: `${PAY_PREFIX}%` },
      transaction,
    },
  );
  const paymentIds = payments.map((r) => Number(r.id));
  if (paymentIds.length) {
    await u.del(qi, "WalletTransactions", { paymentId: paymentIds }, transaction);
    await u.del(qi, "Payments", { id: paymentIds }, transaction);
  }

  const groups = await u.q(
    qi,
    Sequelize,
    "SELECT id FROM OrderGroups WHERE note LIKE :note",
    { note: `${BUNDLE_TAG}%` },
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

const insertBundlePaidOrder = async (
  qi,
  Sequelize,
  transaction,
  { user, branch, variants, groupNote, createdAt, paySeq },
) => {
  if (!variants.length) return false;

  const subtotal = variants.reduce((sum, v) => sum + Number(v.subTotal || 0), 0);
  const shippingFee = 30000;
  const finalAmount = subtotal + shippingFee;
  const created = createdAt || u.dateTime(daysAgo(u.int(2, 90)), u.int(9, 20), 0);

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
  if (!group) return false;

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
        shippingOrderCode: `AI-BUNDLE-GHN-${u.pad(paySeq, 5)}`,
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
  if (!order) return false;

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

  return true;
};

const resolveBundleLines = async (
  qi,
  Sequelize,
  transaction,
  branchId,
  plan,
  repeatIndex,
) => {
  const lines = [];
  for (let i = 0; i < plan.categories.length; i += 1) {
    const variant = await findVariantByCategories(
      qi,
      Sequelize,
      transaction,
      plan.categories[i],
      branchId,
      repeatIndex % 3,
    );
    if (!variant) return null;
    lines.push(buildVariantLine(variant, plan.quantities[i] ?? 1));
  }
  return lines;
};

const seedAiBoughtTogetherPatterns = async (qi, Sequelize) =>
  u.phaseTransaction(qi, async (transaction) => {
    await deleteBundleOrders(qi, Sequelize, transaction);

    const base = await getBase(qi, Sequelize, transaction);
    const users = (await u.getDemoUsers(qi, Sequelize, transaction)).filter(
      (row) => row.roleName === "USER",
    );
    if (!users.length || !base.branches.length) {
      return { ok: false, reason: "missing_users_or_branches" };
    }

    let paySeq = 0;
    const stats = { total: 0, byPlan: {} };

    for (const branch of base.branches) {
      for (const plan of BUNDLE_PLANS) {
        stats.byPlan[plan.code] = stats.byPlan[plan.code] || 0;

        for (let i = 0; i < plan.repeatsPerBranch; i += 1) {
          const lines = await resolveBundleLines(
            qi,
            Sequelize,
            transaction,
            branch.id,
            plan,
            i,
          );
          if (!lines?.length) continue;

          paySeq += 1;
          const buyer = users[(Number(branch.id) * 17 + paySeq) % users.length];
          const note = `${BUNDLE_TAG} ${plan.code}-B${branch.id}-${u.pad(i + 1, 3)}`;
          const ok = await insertBundlePaidOrder(qi, Sequelize, transaction, {
            user: buyer,
            branch,
            variants: lines,
            groupNote: note,
            createdAt: u.dateTime(daysAgo(u.int(3, 120) + i), u.int(9, 20), 0),
            paySeq,
          });
          if (ok) {
            stats.total += 1;
            stats.byPlan[plan.code] += 1;
          }
        }
      }
    }

    return {
      ok: true,
      tag: BUNDLE_TAG,
      branches: base.branches.length,
      ordersCreated: stats.total,
      byPlan: stats.byPlan,
      hint: "Chạy Admin → AI Insights → Cập nhật gợi ý để train lại co-occurrence",
    };
  });

const downAiBoughtTogetherPatterns = async (qi, Sequelize) =>
  u.phaseTransaction(qi, async (transaction) => {
    await deleteBundleOrders(qi, Sequelize, transaction);
  });

module.exports = {
  BUNDLE_TAG,
  BUNDLE_PLANS,
  CAT,
  seedAiBoughtTogetherPatterns,
  downAiBoughtTogetherPatterns,
  findVariantByCategories,
  buildVariantLine,
};
