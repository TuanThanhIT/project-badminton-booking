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
      throw new BadRequestError(
        "Điều chỉnh tồn kho sản phẩm chỉ được truyền variantId",
      );
    }
    return;
  }

  if (itemType === STOCK_ITEM_TYPE.BEVERAGE) {
    if (!beverageId || variantId) {
      throw new BadRequestError(
        "Điều chỉnh tồn kho đồ uống chỉ được truyền beverageId",
      );
    }
    return;
  }

  throw new BadRequestError("Loại hàng tồn kho không hợp lệ");
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
    throw new BadRequestError("Điều chỉnh tồn kho phải chạy trong transaction");
  }

  validateItemReference({ itemType, variantId, beverageId });

  const change = Number(quantityChange);
  if (!Number.isInteger(change) || change === 0) {
    throw new BadRequestError("Số lượng điều chỉnh phải là số nguyên khác 0");
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
    throw new BadRequestError("Tồn kho không đủ");
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
