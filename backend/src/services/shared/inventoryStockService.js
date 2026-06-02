import {
  Beverage,
  BeverageStock,
  StockTransaction,
  VariantStock,
} from "../../models/index.js";
import BadRequestError from "../../errors/BadRequestError.js";
import { STOCK_ITEM_TYPE } from "../../constants/inventoryConstant.js";

const validateItemReference = ({ itemType, variantId, beverageId }) => {
  if (itemType === STOCK_ITEM_TYPE.PRODUCT_VARIANT) {
    if (!variantId || beverageId) {
      throw new BadRequestError("Product variant stock change requires variantId only");
    }
    return;
  }

  if (itemType === STOCK_ITEM_TYPE.BEVERAGE) {
    if (!beverageId || variantId) {
      throw new BadRequestError("Beverage stock change requires beverageId only");
    }
    return;
  }

  throw new BadRequestError("Invalid stock item type");
};

const getOrCreateVariantStock = async ({
  branchId,
  variantId,
  transaction,
  lock,
}) => {
  let stock = await VariantStock.findOne({
    where: { branchId, variantId },
    transaction,
    lock,
  });

  if (!stock) {
    stock = await VariantStock.create(
      {
        branchId,
        variantId,
        stock: 0,
      },
      { transaction },
    );
  }

  return stock;
};

const getOrCreateBeverageStock = async ({
  branchId,
  beverageId,
  transaction,
  lock,
}) => {
  let stock = await BeverageStock.findOne({
    where: { branchId, beverageId },
    transaction,
    lock,
  });

  if (!stock) {
    stock = await BeverageStock.create(
      {
        branchId,
        beverageId,
        stock: 0,
      },
      { transaction },
    );
  }

  return stock;
};

const syncBeverageTotalStock = async (beverageId, transaction) => {
  const stocks = await BeverageStock.findAll({
    attributes: ["stock"],
    where: { beverageId },
    raw: true,
    transaction,
  });
  const totalStock = stocks.reduce(
    (sum, item) => sum + Number(item.stock || 0),
    0,
  );

  await Beverage.update(
    { stock: totalStock },
    { where: { id: beverageId }, transaction },
  );

  return totalStock;
};

const changeItemStock = async ({
  branchId,
  itemType,
  variantId = null,
  beverageId = null,
  quantityChange,
  type,
  referenceType = null,
  referenceId = null,
  note = null,
  createdBy,
  transaction,
}) => {
  if (!transaction) {
    throw new BadRequestError("Stock changes must run inside a transaction");
  }

  validateItemReference({ itemType, variantId, beverageId });

  const change = Number(quantityChange);
  if (!Number.isInteger(change) || change === 0) {
    throw new BadRequestError("Quantity change must be a non-zero integer");
  }

  const lock = transaction.LOCK?.UPDATE || transaction.constructor.LOCK?.UPDATE || true;
  const stock =
    itemType === STOCK_ITEM_TYPE.PRODUCT_VARIANT
      ? await getOrCreateVariantStock({
          branchId,
          variantId,
          transaction,
          lock,
        })
      : await getOrCreateBeverageStock({
          branchId,
          beverageId,
          transaction,
          lock,
        });

  const beforeStock = Number(stock.stock || 0);
  const afterStock = beforeStock + change;

  if (afterStock < 0) {
    throw new BadRequestError("Not enough stock");
  }

  await stock.update({ stock: afterStock }, { transaction });

  if (itemType === STOCK_ITEM_TYPE.BEVERAGE) {
    await syncBeverageTotalStock(beverageId, transaction);
  }

  const stockTransaction = await StockTransaction.create(
    {
      branchId,
      itemType,
      variantId: itemType === STOCK_ITEM_TYPE.PRODUCT_VARIANT ? variantId : null,
      beverageId: itemType === STOCK_ITEM_TYPE.BEVERAGE ? beverageId : null,
      type,
      quantity: change,
      beforeStock,
      afterStock,
      referenceType,
      referenceId,
      note,
      createdBy,
    },
    { transaction },
  );

  return {
    stock,
    stockTransaction,
    beforeStock,
    afterStock,
  };
};

export default {
  changeItemStock,
};
