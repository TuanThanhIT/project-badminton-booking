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
    createdDate: item.createdDate,
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

const getInventoryReceiptsService = async (managerId, query = {}) => {
  const branchId = await getManagerBranchId(managerId);
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 12, 1);
  const offset = (page - 1) * limit;
  const where = { branchId };

  if (query.startDate || query.endDate) {
    where.createdDate = {};
    if (query.startDate) where.createdDate[Op.gte] = new Date(`${query.startDate}T00:00:00`);
    if (query.endDate) where.createdDate[Op.lte] = new Date(`${query.endDate}T23:59:59.999`);
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
    order: [["createdDate", "DESC"]],
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

export default {
  getInventoryReceiptsService,
};
