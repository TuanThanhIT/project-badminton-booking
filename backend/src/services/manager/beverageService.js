import { Op } from "sequelize";
import { Beverage, BeverageStock, BranchManager } from "../../models/index.js";
import sequelize from "../../config/db.js";
import BadRequestError from "../../errors/BadRequestError.js";
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

const parseStock = (stock) => {
  if (stock === undefined || stock === null || stock === "") {
    throw new BadRequestError("Stock is required");
  }

  const stockNumber = Number(stock);

  if (!Number.isInteger(stockNumber) || stockNumber < 0) {
    throw new BadRequestError("Stock must be a non-negative integer");
  }

  return stockNumber;
};

const getBeveragesService = async (managerId, data = {}) => {
  const { page = 1, limit = 10, search } = data;
  const branchId = await getManagerBranchId(managerId);
  const offset = (Number(page) - 1) * Number(limit);

  const where = {};
  if (search) {
    where.beverageName = { [Op.like]: `%${search}%` };
  }

  const { rows, count } = await Beverage.findAndCountAll({
    where,
    attributes: ["id", "beverageName", "thumbnailUrl", "price", "createdDate"],
    include: [
      {
        model: BeverageStock,
        as: "stocks",
        attributes: ["id", "branchId", "stock"],
        where: { branchId },
        required: false,
      },
    ],
    limit: Number(limit),
    offset,
    order: [["beverageName", "ASC"]],
    distinct: true,
  });

  return {
    branchId,
    beverages: rows.map((beverage) => {
      const item = beverage.toJSON();
      const branchStock = item.stocks?.[0];

      return {
        id: item.id,
        beverageName: item.beverageName,
        thumbnailUrl: item.thumbnailUrl,
        price: Number(item.price || 0),
        stockId: branchStock?.id || null,
        branchId,
        stock: Number(branchStock?.stock || 0),
        createdDate: item.createdDate,
      };
    }),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
    },
  };
};

const updateBeverageStockService = async (managerId, beverageId, data) => {
  const branchId = await getManagerBranchId(managerId);
  const stock = parseStock(data.stock);

  return sequelize.transaction(async (transaction) => {
    const beverage = await Beverage.findByPk(beverageId, { transaction });

    if (!beverage) {
      throw new NotFoundError("Không tìm thấy đồ uống");
    }

    const [beverageStock] = await BeverageStock.findOrCreate({
      where: {
        beverageId: Number(beverageId),
        branchId,
      },
      defaults: {
        beverageId: Number(beverageId),
        branchId,
        stock,
      },
      transaction,
    });

    if (Number(beverageStock.stock) !== stock) {
      await beverageStock.update({ stock }, { transaction });
    }

    const stocks = await BeverageStock.findAll({
      attributes: ["stock"],
      where: { beverageId: Number(beverageId) },
      raw: true,
      transaction,
    });
    const totalStock = stocks.reduce((sum, item) => sum + Number(item.stock || 0), 0);

    await beverage.update({ stock: totalStock }, { transaction });

    return {
      id: beverage.id,
      beverageName: beverage.beverageName,
      thumbnailUrl: beverage.thumbnailUrl,
      price: Number(beverage.price || 0),
      stockId: beverageStock.id,
      branchId,
      stock,
      totalStock,
    };
  });
};

export default {
  getBeveragesService,
  updateBeverageStockService,
};
