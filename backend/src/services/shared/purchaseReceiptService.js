import sequelize from "../../config/db.js";
import {
  Beverage,
  Branch,
  Product,
  ProductVariant,
  PurchaseReceipt,
  PurchaseReceiptDetail,
  Supplier,
  User,
} from "../../models/index.js";
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import ForbiddenError from "../../errors/ForbiddenError.js";
import {
  PURCHASE_RECEIPT_STATUS,
  STOCK_ITEM_TYPE,
  STOCK_REFERENCE_TYPE,
  STOCK_TRANSACTION_TYPE,
  SUPPLIER_STATUS,
} from "../../constants/inventoryConstant.js";
import inventoryStockService from "./inventoryStockService.js";
import {
  buildBeverageItemName,
  buildVariantItemName,
  toNumber,
} from "./inventoryMapper.js";

const receiptInclude = [
  { model: Branch, as: "branch", attributes: ["id", "branchName"] },
  {
    model: Supplier,
    as: "supplier",
    attributes: ["id", "supplierName", "phoneNumber", "email"],
  },
  { model: User, as: "creator", attributes: ["id", "username", "email"] },
  { model: User, as: "approver", attributes: ["id", "username", "email"] },
  {
    model: PurchaseReceiptDetail,
    as: "details",
    include: [
      {
        model: ProductVariant,
        as: "variant",
        attributes: ["id", "sku", "size", "color", "price", "productId"],
        include: [{ model: Product, as: "product", attributes: ["id", "productName"] }],
      },
      {
        model: Beverage,
        as: "beverage",
        attributes: ["id", "beverageName", "price", "thumbnailUrl"],
      },
    ],
  },
];

const buildReceiptCode = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PR-${date}-${random}`;
};

const normalizeReceipt = (receipt) => {
  const item = receipt.toJSON ? receipt.toJSON() : receipt;
  return {
    id: item.id,
    receiptCode: item.receiptCode,
    branchId: item.branchId,
    branch: item.branch || null,
    supplierId: item.supplierId,
    supplier: item.supplier || null,
    createdBy: item.createdBy,
    creator: item.creator || null,
    approvedBy: item.approvedBy,
    approver: item.approver || null,
    status: item.status,
    totalAmount: toNumber(item.totalAmount),
    note: item.note,
    approvedAt: item.approvedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    details:
      item.details?.map((detail) => ({
        id: detail.id,
        itemType: detail.itemType,
        variantId: detail.variantId,
        beverageId: detail.beverageId,
        itemName: detail.itemName,
        quantity: Number(detail.quantity || 0),
        importPrice: toNumber(detail.importPrice),
        totalPrice: toNumber(detail.totalPrice),
        variant: detail.variant || null,
        beverage: detail.beverage || null,
      })) || [],
  };
};

const parsePositiveInteger = (value, label) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new BadRequestError(`${label} must be a positive integer`);
  }
  return number;
};

const parseMoney = (value, label) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new BadRequestError(`${label} must be a non-negative number`);
  }
  return number;
};

const buildDetailPayloads = async (details, transaction) => {
  if (!Array.isArray(details) || !details.length) {
    throw new BadRequestError("Purchase receipt details are required");
  }

  const payloads = [];

  for (const detail of details) {
    const itemType = detail.itemType;
    const quantity = parsePositiveInteger(detail.quantity, "Quantity");
    const importPrice = parseMoney(detail.importPrice, "Import price");

    if (itemType === STOCK_ITEM_TYPE.PRODUCT_VARIANT) {
      const variantId = parsePositiveInteger(detail.variantId, "Variant ID");
      const variant = await ProductVariant.findByPk(variantId, {
        include: [{ model: Product, as: "product", attributes: ["id", "productName"] }],
        transaction,
      });

      if (!variant) {
        throw new NotFoundError("Product variant not found");
      }

      payloads.push({
        itemType,
        variantId,
        beverageId: null,
        itemName: detail.itemName || buildVariantItemName(variant),
        quantity,
        importPrice,
        totalPrice: quantity * importPrice,
      });
      continue;
    }

    if (itemType === STOCK_ITEM_TYPE.BEVERAGE) {
      const beverageId = parsePositiveInteger(detail.beverageId, "Beverage ID");
      const beverage = await Beverage.findByPk(beverageId, { transaction });

      if (!beverage) {
        throw new NotFoundError("Beverage not found");
      }

      payloads.push({
        itemType,
        variantId: null,
        beverageId,
        itemName: detail.itemName || buildBeverageItemName(beverage),
        quantity,
        importPrice,
        totalPrice: quantity * importPrice,
      });
      continue;
    }

    throw new BadRequestError("Invalid item type");
  }

  return payloads;
};

const createReceiptService = async ({ branchId, supplierId, createdBy, data }) =>
  sequelize.transaction(async (transaction) => {
    const supplier = await Supplier.findByPk(supplierId, { transaction });
    if (!supplier || supplier.status !== SUPPLIER_STATUS.ACTIVE) {
      throw new NotFoundError("Active supplier not found");
    }

    const detailPayloads = await buildDetailPayloads(data.details, transaction);
    const totalAmount = detailPayloads.reduce(
      (sum, detail) => sum + Number(detail.totalPrice || 0),
      0,
    );

    const receipt = await PurchaseReceipt.create(
      {
        receiptCode: data.receiptCode || buildReceiptCode(),
        branchId,
        supplierId,
        createdBy,
        status: PURCHASE_RECEIPT_STATUS.PENDING,
        totalAmount,
        note: data.note || null,
      },
      { transaction },
    );

    await PurchaseReceiptDetail.bulkCreate(
      detailPayloads.map((detail) => ({
        ...detail,
        purchaseReceiptId: receipt.id,
      })),
      { transaction },
    );

    const created = await PurchaseReceipt.findByPk(receipt.id, {
      include: receiptInclude,
      transaction,
    });

    return normalizeReceipt(created);
  });

const getReceiptsService = async ({ where = {}, query = {} }) => {
  const { page = 1, limit = 10, status, supplierId, branchId } = query;
  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.max(Number(limit) || 10, 1);
  const receiptWhere = { ...where };

  if (status) receiptWhere.status = status;
  if (supplierId) receiptWhere.supplierId = Number(supplierId);
  if (branchId) receiptWhere.branchId = Number(branchId);

  const { rows, count } = await PurchaseReceipt.findAndCountAll({
    where: receiptWhere,
    include: receiptInclude.filter((item) => item.as !== "details"),
    distinct: true,
    limit: limitNumber,
    offset: (pageNumber - 1) * limitNumber,
    order: [["createdAt", "DESC"]],
  });

  return {
    purchaseReceipts: rows.map(normalizeReceipt),
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total: count,
    },
  };
};

const getReceiptDetailService = async ({ receiptId, branchId = null }) => {
  const where = { id: receiptId };
  if (branchId) where.branchId = branchId;

  const receipt = await PurchaseReceipt.findOne({
    where,
    include: receiptInclude,
  });

  if (!receipt) {
    throw new NotFoundError("Purchase receipt not found");
  }

  return normalizeReceipt(receipt);
};

const approveReceiptService = async ({ receiptId, adminId }) =>
  sequelize.transaction(async (transaction) => {
    const receipt = await PurchaseReceipt.findByPk(receiptId, {
      include: [{ model: PurchaseReceiptDetail, as: "details" }],
      transaction,
      lock: transaction.LOCK?.UPDATE || transaction.constructor.LOCK?.UPDATE || true,
    });

    if (!receipt) {
      throw new NotFoundError("Purchase receipt not found");
    }

    if (receipt.status !== PURCHASE_RECEIPT_STATUS.PENDING) {
      throw new BadRequestError("Only pending purchase receipts can be approved");
    }

    if (!receipt.details?.length) {
      throw new BadRequestError("Purchase receipt has no details");
    }

    for (const detail of receipt.details) {
      await inventoryStockService.changeItemStock({
        branchId: receipt.branchId,
        itemType: detail.itemType,
        variantId: detail.variantId,
        beverageId: detail.beverageId,
        quantityChange: Number(detail.quantity),
        type: STOCK_TRANSACTION_TYPE.IMPORT,
        referenceType: STOCK_REFERENCE_TYPE.PURCHASE_RECEIPT,
        referenceId: receipt.id,
        note: `Import from receipt ${receipt.receiptCode}`,
        createdBy: adminId,
        transaction,
      });
    }

    await receipt.update(
      {
        status: PURCHASE_RECEIPT_STATUS.APPROVED,
        approvedBy: adminId,
        approvedAt: new Date(),
      },
      { transaction },
    );

    const approved = await PurchaseReceipt.findByPk(receipt.id, {
      include: receiptInclude,
      transaction,
    });

    return normalizeReceipt(approved);
  });

const rejectReceiptService = async ({ receiptId, adminId, reason }) =>
  sequelize.transaction(async (transaction) => {
    const receipt = await PurchaseReceipt.findByPk(receiptId, {
      transaction,
      lock: transaction.LOCK?.UPDATE || transaction.constructor.LOCK?.UPDATE || true,
    });

    if (!receipt) {
      throw new NotFoundError("Purchase receipt not found");
    }

    if (receipt.status !== PURCHASE_RECEIPT_STATUS.PENDING) {
      throw new BadRequestError("Only pending purchase receipts can be rejected");
    }

    await receipt.update(
      {
        status: PURCHASE_RECEIPT_STATUS.REJECTED,
        approvedBy: adminId,
        approvedAt: new Date(),
        note: reason || receipt.note,
      },
      { transaction },
    );

    return normalizeReceipt(
      await PurchaseReceipt.findByPk(receipt.id, {
        include: receiptInclude,
        transaction,
      }),
    );
  });

const cancelReceiptService = async ({ receiptId, managerId, branchId }) =>
  sequelize.transaction(async (transaction) => {
    const receipt = await PurchaseReceipt.findByPk(receiptId, {
      transaction,
      lock: transaction.LOCK?.UPDATE || transaction.constructor.LOCK?.UPDATE || true,
    });

    if (!receipt) {
      throw new NotFoundError("Purchase receipt not found");
    }

    if (Number(receipt.branchId) !== Number(branchId)) {
      throw new ForbiddenError("Cannot cancel another branch purchase receipt");
    }

    if (Number(receipt.createdBy) !== Number(managerId)) {
      throw new ForbiddenError("Only creator can cancel this purchase receipt");
    }

    if (receipt.status !== PURCHASE_RECEIPT_STATUS.PENDING) {
      throw new BadRequestError("Only pending purchase receipts can be cancelled");
    }

    await receipt.update(
      { status: PURCHASE_RECEIPT_STATUS.CANCELLED },
      { transaction },
    );

    return normalizeReceipt(
      await PurchaseReceipt.findByPk(receipt.id, {
        include: receiptInclude,
        transaction,
      }),
    );
  });

export default {
  createReceiptService,
  getReceiptsService,
  getReceiptDetailService,
  approveReceiptService,
  rejectReceiptService,
  cancelReceiptService,
};
