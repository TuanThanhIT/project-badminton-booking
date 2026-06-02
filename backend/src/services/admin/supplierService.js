import { Op } from "sequelize";
import { Supplier } from "../../models/index.js";
import BadRequestError from "../../errors/BadRequestError.js";
import NotFoundError from "../../errors/NotFoundError.js";
import { SUPPLIER_STATUS } from "../../constants/inventoryConstant.js";

const normalizeSupplier = (supplier) => {
  const item = supplier.toJSON ? supplier.toJSON() : supplier;
  return {
    id: item.id,
    supplierName: item.supplierName,
    phoneNumber: item.phoneNumber,
    email: item.email,
    address: item.address,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const buildSupplierPayload = (data) => ({
  supplierName: data.supplierName,
  phoneNumber: data.phoneNumber || null,
  email: data.email || null,
  address: data.address || null,
  status: data.status || SUPPLIER_STATUS.ACTIVE,
});

const getSuppliersService = async (query = {}) => {
  const { page = 1, limit = 10, search, status } = query;
  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.max(Number(limit) || 10, 1);
  const where = {};

  if (search) {
    where[Op.or] = [
      { supplierName: { [Op.like]: `%${search}%` } },
      { phoneNumber: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  if (status) {
    where.status = status;
  }

  const { rows, count } = await Supplier.findAndCountAll({
    where,
    limit: limitNumber,
    offset: (pageNumber - 1) * limitNumber,
    order: [["createdAt", "DESC"]],
  });

  return {
    suppliers: rows.map(normalizeSupplier),
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total: count,
    },
  };
};

const createSupplierService = async (data) => {
  if (!data.supplierName?.trim()) {
    throw new BadRequestError("Supplier name is required");
  }

  const supplier = await Supplier.create(buildSupplierPayload(data));
  return normalizeSupplier(supplier);
};

const updateSupplierService = async (supplierId, data) => {
  const supplier = await Supplier.findByPk(supplierId);
  if (!supplier) {
    throw new NotFoundError("Supplier not found");
  }

  if (data.supplierName !== undefined && !data.supplierName?.trim()) {
    throw new BadRequestError("Supplier name cannot be empty");
  }

  await supplier.update(buildSupplierPayload({ ...supplier.toJSON(), ...data }));
  return normalizeSupplier(supplier);
};

const updateSupplierStatusService = async (supplierId, status) => {
  if (!Object.values(SUPPLIER_STATUS).includes(status)) {
    throw new BadRequestError("Supplier status is invalid");
  }

  const supplier = await Supplier.findByPk(supplierId);
  if (!supplier) {
    throw new NotFoundError("Supplier not found");
  }

  await supplier.update({ status });
  return normalizeSupplier(supplier);
};

const deleteSupplierService = async (supplierId) => {
  const supplier = await Supplier.findByPk(supplierId);
  if (!supplier) {
    throw new NotFoundError("Supplier not found");
  }

  await supplier.destroy();
  return { id: Number(supplierId) };
};

export default {
  getSuppliersService,
  createSupplierService,
  updateSupplierService,
  updateSupplierStatusService,
  deleteSupplierService,
};
