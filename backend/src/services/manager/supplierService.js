import { Op } from "sequelize";
import { Supplier } from "../../models/index.js";
import { SUPPLIER_STATUS } from "../../constants/inventoryConstant.js";

const getSuppliersService = async (query = {}) => {
  const { page = 1, limit = 20, search } = query;
  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.max(Number(limit) || 20, 1);
  const where = { status: SUPPLIER_STATUS.ACTIVE };

  if (search) {
    where[Op.or] = [
      { supplierName: { [Op.like]: `%${search}%` } },
      { phoneNumber: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  const { rows, count } = await Supplier.findAndCountAll({
    where,
    attributes: ["id", "supplierName", "phoneNumber", "email", "address"],
    limit: limitNumber,
    offset: (pageNumber - 1) * limitNumber,
    order: [["supplierName", "ASC"]],
  });

  return {
    suppliers: rows,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total: count,
    },
  };
};

export default {
  getSuppliersService,
};
