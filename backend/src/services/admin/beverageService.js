import { Beverage } from "../../models/index.js";
import { Op } from "sequelize";
import ConflictError from "../../errors/ConflictError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import sequelize from "../../config/db.js";

const addBeverageService = async (data) => {
  const { name, thumbnailUrl, price, stock } = data;
  const checkBeverage = await Beverage.findOne({ where: { name } });
  if (checkBeverage) {
    throw new ConflictError("Đồ uống này đã tồn tại");
  }
  const beverage = await Beverage.create({
    name,
    thumbnailUrl,
    price,
    stock,
  });
  return beverage;
};

const updateBeverageService = async (data) => {
  const { beverageId, updateData } = data;
  return sequelize.transaction(async (t) => {
    const beverage = await Beverage.findByPk(beverageId, { transaction: t });
    if (!beverage) {
      throw new NotFoundError("Không tìm thấy đồ uống");
    }
    await beverage.update(updateData, { transaction: t });
    return beverage;
  });
};

const getBeverageByIdService = async (data) => {
  const { beverageId } = data;
  const beverage = await Beverage.findByPk(beverageId);
  if (!beverage) {
    throw new NotFoundError("Không tìm thấy đồ uống");
  }
  return beverage;
};

const getAllBeveragesService = async (data) => {
  const { page, limit, keyword } = data;
  const p = page ?? 1;
  const l = limit ?? 10;

  const offset = (p - 1) * l;

  const { rows, count } = await Beverage.findAndCountAll({
    where: keyword
      ? {
          name: {
            [Op.like]: `%${keyword}%`,
          },
        }
      : {},
    order: [["createdDate", "DESC"]],
    limit: l,
    offset,
  });

  return {
    beverages: rows,
    pagination: {
      total: count,
      page: p,
      limit: l,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const beverageService = {
  addBeverageService,
  updateBeverageService,
  getBeverageByIdService,
  getAllBeveragesService,
};

export default beverageService;
