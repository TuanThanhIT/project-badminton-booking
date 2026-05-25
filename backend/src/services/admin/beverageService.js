import { Op } from "sequelize";
import { Beverage, BeverageStock, Branch } from "../../models/index.js";
import NotFoundError from "../../errors/NotFoundError.js";
import ConflictError from "../../errors/ConflictError.js";

const getAdminBeveragesService = async (data) => {
  const { page = 1, limit = 10, search } = data;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) where.beverageName = { [Op.like]: `%${search}%` };

  const { rows, count } = await Beverage.findAndCountAll({
    where,
    attributes: ["id", "beverageName", "thumbnailUrl", "price", "createdDate"],
    include: [
      {
        model: BeverageStock,
        as: "stocks",
        attributes: ["branchId", "stock"],
        include: [{ model: Branch, as: "branch", attributes: ["id", "branchName"] }],
      },
    ],
    limit: Number(limit),
    offset: Number(offset),
    order: [["createdDate", "DESC"]],
  });

  return {
    beverages: rows.map((b) => {
      const obj = b.toJSON();
      const totalStock = (obj.stocks || []).reduce((sum, s) => sum + s.stock, 0);
      return { ...obj, totalStock };
    }),
    pagination: { page: Number(page), limit: Number(limit), total: count },
  };
};

const createAdminBeverageService = async (data) => {
  const { beverageName, thumbnailUrl, price } = data;

  const existing = await Beverage.findOne({ where: { beverageName } });
  if (existing) throw new ConflictError("Tên đồ uống đã tồn tại");

  const beverage = await Beverage.create({ beverageName, thumbnailUrl, price });
  return beverage.toJSON();
};

const updateAdminBeverageService = async (beverageId, data) => {
  const { beverageName, thumbnailUrl, price } = data;
  const beverage = await Beverage.findByPk(beverageId);
  if (!beverage) throw new NotFoundError("Không tìm thấy đồ uống");

  if (beverageName && beverageName !== beverage.beverageName) {
    const existing = await Beverage.findOne({
      where: { beverageName, id: { [Op.ne]: beverageId } },
    });
    if (existing) throw new ConflictError("Tên đồ uống đã tồn tại");
  }

  await beverage.update({ beverageName, thumbnailUrl, price });
  return beverage.toJSON();
};

const deleteAdminBeverageService = async (beverageId) => {
  const beverage = await Beverage.findByPk(beverageId);
  if (!beverage) throw new NotFoundError("Không tìm thấy đồ uống");
  await beverage.destroy();
  return { id: Number(beverageId) };
};

const getBeverageStocksService = async (beverageId) => {
  const beverage = await Beverage.findByPk(beverageId);
  if (!beverage) throw new NotFoundError("Không tìm thấy đồ uống");

  const [branches, existingStocks] = await Promise.all([
    Branch.findAll({ attributes: ["id", "branchName"], where: { isActive: true }, order: [["branchName", "ASC"]] }),
    BeverageStock.findAll({ where: { beverageId }, raw: true }),
  ]);

  const stockMap = {};
  existingStocks.forEach((s) => { stockMap[s.branchId] = s.stock; });

  return branches.map((br) => ({
    branchId: br.id,
    branchName: br.branchName,
    stock: stockMap[br.id] ?? 0,
  }));
};

const adminBeverageService = {
  getAdminBeveragesService,
  createAdminBeverageService,
  updateAdminBeverageService,
  deleteAdminBeverageService,
  getBeverageStocksService,
};

export default adminBeverageService;
