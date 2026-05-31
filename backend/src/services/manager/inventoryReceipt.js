import { Op } from "sequelize";
import {
  BranchManager,
  InventoryReceipt,
  Product,
  ProductVariant,
  Profile,
  User,
} from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";

const getManagerBranchId = async (managerId) => {
  const branchManager = await BranchManager.findOne({
    attributes: ["branchId"],
    where: { managerId, isActive: true },
    raw: true,
  });

  if (!branchManager) {
    throw new NotFoundError("Manager has no active branch");
  }

  return branchManager.branchId;
};

const mapReceipt = (receipt) => {
  const item = receipt.get ? receipt.get({ plain: true }) : receipt;

  return {
    id: item.id,
    branchId: item.branchId,
    managerId: item.managerId,
    productId: item.productId,
    variantId: item.variantId,
    quantity: Number(item.quantity || 0),
    sellingPrice: Number(item.sellingPrice || 0),
    importPrice: Number(item.importPrice || 0),
    totalAmount: Number(item.totalAmount || 0),
    previousStock: Number(item.previousStock || 0),
    newStock: Number(item.newStock || 0),
    note: item.note || null,
    createdAt: item.createdAt,
    product: item.product
      ? {
          id: item.product.id,
          productName: item.product.productName,
          thumbnailUrl: item.product.thumbnailUrl,
        }
      : null,
    variant: item.variant
      ? {
          id: item.variant.id,
          sku: item.variant.sku,
          color: item.variant.color,
          size: item.variant.size,
          material: item.variant.material,
        }
      : null,
    manager: item.manager
      ? {
          id: item.manager.id,
          username: item.manager.username,
          fullName: item.manager.profile?.fullName || null,
        }
      : null,
  };
};

const parseReceiptDate = (date) => {
  const value = String(date || "").trim();
  const bangkokNow = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const targetDate = value || bangkokNow.toISOString().slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    throw new BadRequestError("Invalid export date");
  }

  return targetDate;
};

const getDateRange = (date) => ({
  start: new Date(`${date}T00:00:00+07:00`),
  end: new Date(`${date}T23:59:59.999+07:00`),
});

const escapeExcelValue = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "Asia/Bangkok",
      }).format(new Date(value))
    : "";

const getVariantName = (variant) =>
  [variant?.sku, variant?.color, variant?.size, variant?.material]
    .filter(Boolean)
    .join(" - ") || "Mac dinh";

const mergeDailyReceiptRows = (rows) => {
  const grouped = new Map();

  rows.forEach((item) => {
    const key = `${item.productId}:${item.variantId}`;
    const current = grouped.get(key);

    if (!current) {
      grouped.set(key, {
        ...item,
        note: item.note || "",
      });
      return;
    }

    current.quantity = Number(current.quantity || 0) + Number(item.quantity || 0);
    current.totalAmount = Number(current.totalAmount || 0) + Number(item.totalAmount || 0);
    current.newStock = Number(item.newStock || 0);
    current.createdAt = item.createdAt;
    if (item.note) {
      current.note = current.note ? `${current.note}; ${item.note}` : item.note;
    }
  });

  return [...grouped.values()];
};

const buildInventoryReceiptExcel = ({ date, rows }) => {
  const totalQuantity = rows.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalAmount = rows.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  const bodyRows = rows.length
    ? rows
        .map(
          (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeExcelValue(formatDateTime(item.createdAt))}</td>
              <td>${escapeExcelValue(item.product?.productName)}</td>
              <td>${escapeExcelValue(getVariantName(item.variant))}</td>
              <td>${Number(item.quantity || 0)}</td>
              <td>${Number(item.previousStock || 0)}</td>
              <td>${Number(item.newStock || 0)}</td>
              <td>${Number(item.importPrice || 0)}</td>
              <td>${Number(item.sellingPrice || 0)}</td>
              <td>${Number(item.totalAmount || 0)}</td>
              <td>${escapeExcelValue(item.manager?.profile?.fullName || item.manager?.username)}</td>
              <td>${escapeExcelValue(item.note)}</td>
            </tr>
          `,
        )
        .join("")
    : `
      <tr>
        <td colspan="12">Khong co san pham nhap trong ngay nay</td>
      </tr>
    `;

  return `\uFEFF<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }
      th, td { border: 1px solid #999; padding: 6px; }
      th { background: #d9ead3; font-weight: 700; }
      .title { font-size: 18px; font-weight: 700; }
      .summary { font-weight: 700; background: #f3f4f6; }
    </style>
  </head>
  <body>
    <table>
      <tr><td class="title" colspan="12">HOA DON NHAP KHO SAN PHAM</td></tr>
      <tr><td colspan="12">Ngay nhap: ${escapeExcelValue(date)}</td></tr>
      <tr>
        <th>STT</th>
        <th>Thoi gian nhap</th>
        <th>San pham</th>
        <th>Bien the</th>
        <th>So luong nhap</th>
        <th>Ton truoc</th>
        <th>Ton sau</th>
        <th>Gia nhap</th>
        <th>Gia ban</th>
        <th>Thanh tien</th>
        <th>Nguoi nhap</th>
        <th>Ghi chu</th>
      </tr>
      ${bodyRows}
      <tr class="summary">
        <td colspan="4">Tong</td>
        <td>${totalQuantity}</td>
        <td colspan="4"></td>
        <td>${totalAmount}</td>
        <td colspan="2"></td>
      </tr>
    </table>
  </body>
</html>`;
};

const getInventoryReceiptsService = async (managerId, query = {}) => {
  const branchId = await getManagerBranchId(managerId);
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 12, 1);
  const offset = (page - 1) * limit;
  const where = { branchId };

  if (query.startDate || query.endDate) {
    where.createdAt = {};
    if (query.startDate) where.createdAt[Op.gte] = new Date(`${query.startDate}T00:00:00`);
    if (query.endDate) where.createdAt[Op.lte] = new Date(`${query.endDate}T23:59:59.999`);
  }

  const { rows, count } = await InventoryReceipt.findAndCountAll({
    where,
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["id", "productName", "thumbnailUrl"],
      },
      {
        model: ProductVariant,
        as: "variant",
        attributes: ["id", "sku", "color", "size", "material"],
      },
      {
        model: User,
        as: "manager",
        attributes: ["id", "username"],
        include: [{ model: Profile, as: "profile", attributes: ["fullName"] }],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  return {
    branchId,
    items: rows.map(mapReceipt),
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const exportInventoryReceiptsService = async (managerId, query = {}) => {
  const branchId = await getManagerBranchId(managerId);
  const date = parseReceiptDate(query.date);
  const { start, end } = getDateRange(date);

  const rows = await InventoryReceipt.findAll({
    where: {
      branchId,
      createdAt: {
        [Op.gte]: start,
        [Op.lte]: end,
      },
    },
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["id", "productName", "thumbnailUrl"],
      },
      {
        model: ProductVariant,
        as: "variant",
        attributes: ["id", "sku", "color", "size", "material"],
      },
      {
        model: User,
        as: "manager",
        attributes: ["id", "username"],
        include: [{ model: Profile, as: "profile", attributes: ["fullName"] }],
      },
    ],
    order: [["createdAt", "ASC"]],
  });

  return {
    date,
    filename: `inventory-receipts-${date}.xls`,
    content: buildInventoryReceiptExcel({
      date,
      rows: mergeDailyReceiptRows(rows.map((row) => row.get({ plain: true }))),
    }),
  };
};

export default {
  getInventoryReceiptsService,
  exportInventoryReceiptsService,
};
