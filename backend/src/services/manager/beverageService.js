import { Op } from "sequelize";
import { Beverage, BeverageStock, BranchManager } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";

const getManagerBranchId = async (managerId) => {
  const branchManager = await BranchManager.findOne({
    attributes: ["branchId"],
    where: { managerId, isActive: true },
    raw: true,
  });

  if (!branchManager) {
    throw new NotFoundError("Quản lý chưa được gán chi nhánh đang hoạt động");
  }

  return branchManager.branchId;
};

const getStockStatus = (stock) => {
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock <= 5) return "LOW_STOCK";
  return "IN_STOCK";
};

const getBeveragesService = async (managerId, data = {}) => {
  const { page = 1, limit = 10, search, keyword, stockStatus } = data;
  const branchId = await getManagerBranchId(managerId);
  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.max(Number(limit) || 10, 1);

  const where = {};
  const keywordText = String(keyword || search || "").trim();
  if (keywordText) {
    where.beverageName = { [Op.like]: `%${keywordText}%` };
  }

  const rows = await Beverage.findAll({
    where,
    attributes: ["id", "beverageName", "thumbnailUrl", "price", "createdAt"],
    include: [
      {
        model: BeverageStock,
        as: "stocks",
        attributes: ["id", "branchId", "stock"],
        where: { branchId },
        required: false,
      },
    ],
    order: [["beverageName", "ASC"]],
  });

  let beverages = rows.map((beverage) => {
    const item = beverage.toJSON();
    const branchStock = item.stocks?.[0];
    const stock = Number(branchStock?.stock || 0);

    return {
      id: item.id,
      beverageName: item.beverageName,
      thumbnailUrl: item.thumbnailUrl,
      price: Number(item.price || 0),
      stockId: branchStock?.id || null,
      branchId,
      stock,
      stockStatus: getStockStatus(stock),
      createdAt: item.createdAt,
    };
  });

  if (stockStatus) {
    beverages = beverages.filter((beverage) => beverage.stockStatus === stockStatus);
  }

  const count = beverages.length;
  const offset = (pageNumber - 1) * limitNumber;

  return {
    branchId,
    beverages: beverages.slice(offset, offset + limitNumber),
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total: count,
    },
  };
};

export default {
  getBeveragesService,
};
