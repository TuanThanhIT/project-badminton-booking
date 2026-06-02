import { Op } from "sequelize";
import {
  Beverage,
  BeverageStock,
  Branch,
  Product,
  ProductVariant,
  StockTransaction,
  User,
  VariantStock,
} from "../../models/index.js";
import { STOCK_ITEM_TYPE } from "../../constants/inventoryConstant.js";
import { toNumber } from "./inventoryMapper.js";

const buildPagination = (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};

const getVariantStocksService = async ({ branchId = null, query = {} }) => {
  const { page, limit, offset } = buildPagination(query);
  const where = {};
  if (branchId) where.branchId = branchId;

  const { rows, count } = await VariantStock.findAndCountAll({
    where,
    include: [
      {
        model: ProductVariant,
        as: "variant",
        attributes: ["id", "sku", "size", "color", "price", "productId"],
        include: [{ model: Product, as: "product", attributes: ["id", "productName", "thumbnailUrl", "brand"] }],
      },
      { model: Branch, as: "branch", attributes: ["id", "branchName"] },
    ],
    limit,
    offset,
    order: [["id", "DESC"]],
  });

  return {
    variantStocks: rows.map((row) => {
      const item = row.toJSON();
      return {
        id: item.id,
        variantId: item.variantId,
        branchId: item.branchId,
        stock: Number(item.stock || 0),
        variant: item.variant,
        branch: item.branch,
      };
    }),
    pagination: { page, limit, total: count },
  };
};

const getBeverageStocksService = async ({ branchId = null, query = {} }) => {
  const { page, limit, offset } = buildPagination(query);
  const where = {};
  if (branchId) where.branchId = branchId;

  const { rows, count } = await BeverageStock.findAndCountAll({
    where,
    include: [
      {
        model: Beverage,
        as: "beverage",
        attributes: ["id", "beverageName", "thumbnailUrl", "price"],
      },
      { model: Branch, as: "branch", attributes: ["id", "branchName"] },
    ],
    limit,
    offset,
    order: [["id", "DESC"]],
  });

  return {
    beverageStocks: rows.map((row) => {
      const item = row.toJSON();
      return {
        id: item.id,
        beverageId: item.beverageId,
        branchId: item.branchId,
        stock: Number(item.stock || 0),
        beverage: item.beverage,
        branch: item.branch,
      };
    }),
    pagination: { page, limit, total: count },
  };
};

const getStockTransactionsService = async ({ branchId = null, query = {} }) => {
  const { page, limit, offset } = buildPagination(query);
  const where = {};

  if (branchId) where.branchId = branchId;
  if (query.itemType) where.itemType = query.itemType;
  if (query.type) where.type = query.type;
  if (query.variantId) where.variantId = Number(query.variantId);
  if (query.beverageId) where.beverageId = Number(query.beverageId);
  if (query.startDate || query.endDate) {
    where.createdAt = {};
    if (query.startDate) where.createdAt[Op.gte] = new Date(`${query.startDate}T00:00:00`);
    if (query.endDate) where.createdAt[Op.lte] = new Date(`${query.endDate}T23:59:59`);
  }

  const { rows, count } = await StockTransaction.findAndCountAll({
    where,
    include: [
      { model: Branch, as: "branch", attributes: ["id", "branchName"] },
      {
        model: ProductVariant,
        as: "variant",
        attributes: ["id", "sku", "size", "color", "productId"],
        include: [{ model: Product, as: "product", attributes: ["id", "productName"] }],
      },
      {
        model: Beverage,
        as: "beverage",
        attributes: ["id", "beverageName", "thumbnailUrl"],
      },
      { model: User, as: "creator", attributes: ["id", "username", "email"] },
    ],
    distinct: true,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    stockTransactions: rows.map((row) => {
      const item = row.toJSON();
      return {
        ...item,
        quantity: Number(item.quantity || 0),
        beforeStock: Number(item.beforeStock || 0),
        afterStock: Number(item.afterStock || 0),
      };
    }),
    pagination: { page, limit, total: count },
  };
};

const getVariantStockHistoryService = ({ branchId, variantId, query = {} }) =>
  getStockTransactionsService({
    branchId,
    query: {
      ...query,
      itemType: STOCK_ITEM_TYPE.PRODUCT_VARIANT,
      variantId,
    },
  });

const getBeverageStockHistoryService = ({ branchId, beverageId, query = {} }) =>
  getStockTransactionsService({
    branchId,
    query: {
      ...query,
      itemType: STOCK_ITEM_TYPE.BEVERAGE,
      beverageId,
    },
  });

export default {
  getVariantStocksService,
  getBeverageStocksService,
  getStockTransactionsService,
  getVariantStockHistoryService,
  getBeverageStockHistoryService,
};
