"use strict";

const bcrypt = require("bcrypt");
const { QueryTypes } = require("sequelize");
const seedData = require("../data/static-seed-data.cjs");

const RAW_PASSWORDS = Object.freeze({
  ADMIN: "@Admin123456",
  MANAGER: "@Manager123456",
  USER: "@User123456",
  EMPLOYEE: "@Employee123456",
  COACH: "@Coach123456",
});

const TABLE_NAMES = {
  "roles": "Roles",
  "users": "Users",
  "profiles": "Profiles",
  "wallets": "Wallets",
  "categories": "Categories",
  "branches": "Branches",
  "branchimages": "BranchImages",
  "courts": "Courts",
  "courtprices": "CourtPrices",
  "products": "Products",
  "productimages": "ProductImages",
  "productvariants": "ProductVariants",
  "variantstocks": "VariantStocks",
  "beverages": "Beverages",
  "beveragestocks": "BeverageStocks",
  "suppliers": "Suppliers",
  "discounts": "Discounts",
  "branchmanagers": "BranchManagers",
  "branchemployees": "BranchEmployees",
  "coachprofiles": "CoachProfiles"
};

const ROLE_ORDER = ["ADMIN", "USER", "EMPLOYEE", "COACH", "MANAGER"];

const createExampleImage = (text) =>
  `https://placehold.co/800x800/png?text=${encodeURIComponent(text)}`;

const slugify = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d")
  .replace(/Đ/g, "D")
  .replace(/[^a-zA-Z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .toLowerCase();

const chunkArray = (items, size = 500) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));

const hashPasswordsByRole = async () => ({
  ADMIN: await bcrypt.hash(RAW_PASSWORDS.ADMIN, 10),
  MANAGER: await bcrypt.hash(RAW_PASSWORDS.MANAGER, 10),
  USER: await bcrypt.hash(RAW_PASSWORDS.USER, 10),
  EMPLOYEE: await bcrypt.hash(RAW_PASSWORDS.EMPLOYEE, 10),
  COACH: await bcrypt.hash(RAW_PASSWORDS.COACH, 10),
});

const phaseTransaction = async (queryInterface, work) => {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    const result = await work(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const withMigrationDefaults = (key, row) => {
  if (key === "discounts") {
    return {
      visibility: "PUBLIC",
      branchId: null,
      startHour: null,
      endHour: null,
      ...row,
    };
  }
  return row;
};

const getRows = (key) => (seedData[key] || []).map((row) => {
  const source = withMigrationDefaults(key, row);
  const copy = { ...source };
  delete copy._demoAdded;
  delete copy.kind;
  return copy;
});

const getIds = (key) => getRows(key).map((row) => row.id).filter((id) => id !== undefined && id !== null);

const validateUniqueRows = (rows, fields, label) => {
  for (const field of fields) {
    const seen = new Set();
    for (const row of rows) {
      if (row[field] === null || row[field] === undefined) continue;
      const key = String(row[field]).toLowerCase();
      if (seen.has(key)) throw new Error(`${label}: duplicate ${field} ${row[field]}`);
      seen.add(key);
    }
  }
};

const findRowsByUniqueValues = async (queryInterface, tableName, field, values, transaction) => {
  if (!values.length) return [];
  return queryInterface.sequelize.query(
    `SELECT * FROM \`${tableName}\` WHERE \`${field}\` IN (:values)`,
    { type: QueryTypes.SELECT, replacements: { values }, transaction },
  );
};

const describeTable = async (queryInterface, tableName) => queryInterface.describeTable(tableName);

const sanitizeRowsForTable = async (queryInterface, tableName, rows) => {
  const columns = await describeTable(queryInterface, tableName);
  const valid = new Set(Object.keys(columns));
  return rows.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => valid.has(key))));
};

const upsertRows = async (queryInterface, tableName, rows, transaction, updateOnDuplicate) => {
  if (!rows.length) return;
  const cleanRows = await sanitizeRowsForTable(queryInterface, tableName, rows);
  const updateFields = updateOnDuplicate || Object.keys(cleanRows[0]).filter((key) => key !== "id");
  for (const chunk of chunkArray(cleanRows)) {
    await queryInterface.bulkInsert(tableName, chunk, { transaction, updateOnDuplicate: updateFields });
  }
};

const deleteByIds = async (queryInterface, tableName, ids, transaction) => {
  if (!ids.length) return;
  await queryInterface.bulkDelete(tableName, { id: ids }, { transaction });
};

const deleteByUniqueValues = async (queryInterface, tableName, field, values, transaction) => {
  if (!values.length) return;
  await queryInterface.bulkDelete(tableName, { [field]: values }, { transaction });
};

const ensureRoles = async (queryInterface, transaction) => {
  const rows = ROLE_ORDER.map((roleName, index) => ({ id: index + 1, roleName }));
  await upsertRows(queryInterface, "Roles", rows, transaction, ["roleName"]);
};

const roleMap = async (queryInterface, transaction) => {
  const rows = await queryInterface.sequelize.query("SELECT id, roleName FROM Roles", { type: QueryTypes.SELECT, transaction });
  return new Map(rows.map((row) => [Number(row.id), row.roleName]));
};

const seedRoles = async (queryInterface) => phaseTransaction(queryInterface, async (transaction) => {
  await ensureRoles(queryInterface, transaction);
});

const downRoles = async (queryInterface) => phaseTransaction(queryInterface, async (transaction) => {
  await queryInterface.bulkDelete("Roles", { roleName: ROLE_ORDER }, { transaction });
});

const seedSystemAccounts = async (queryInterface) => phaseTransaction(queryInterface, async (transaction) => {
  await ensureRoles(queryInterface, transaction);
  const roles = await roleMap(queryInterface, transaction);
  const hashedPasswords = await hashPasswordsByRole();
  const users = getRows("users").map((user) => {
    const roleName = roles.get(Number(user.roleId));
    return {
      ...user,
      password: hashedPasswords[roleName] || hashedPasswords.USER,
      accountStatus: "ACTIVE",
      suspendedUntil: null,
      suspensionReason: null,
      violationCount: 0,
      lastViolationAt: null,
    };
  });
  validateUniqueRows(users, ["username", "email"], "Users");
  await upsertRows(queryInterface, "Users", users, transaction, ["password", "email", "isVerified", "isActive", "accountStatus", "suspendedUntil", "suspensionReason", "violationCount", "lastViolationAt", "roleId", "createdAt", "updatedAt"]);
  await upsertRows(queryInterface, "Profiles", getRows("profiles"), transaction);
  await upsertRows(queryInterface, "Wallets", getRows("wallets"), transaction);
});

const downSystemAccounts = async (queryInterface) => phaseTransaction(queryInterface, async (transaction) => {
  await deleteByIds(queryInterface, "Wallets", getIds("wallets"), transaction);
  await deleteByIds(queryInterface, "Profiles", getIds("profiles"), transaction);
  await deleteByIds(queryInterface, "Users", getIds("users"), transaction);
});

const seedSimpleTable = (key) => async (queryInterface) => phaseTransaction(queryInterface, async (transaction) => {
  const tableName = TABLE_NAMES[key];
  const rows = getRows(key);
  if (key === "products") validateUniqueRows(rows, ["productName"], "Products");
  if (key === "productvariants") validateUniqueRows(rows, ["sku"], "ProductVariants");
  if (key === "discounts") validateUniqueRows(rows, ["code"], "Discounts");
  if (key === "categories") validateUniqueRows(rows, ["cateName"], "Categories");
  if (key === "branches") validateUniqueRows(rows, ["branchName"], "Branches");
  await upsertRows(queryInterface, tableName, rows, transaction);
});

const downSimpleTable = (key) => async (queryInterface) => phaseTransaction(queryInterface, async (transaction) => {
  if (key === "branchemployees") {
    for (const row of getRows("branchemployees")) {
      await queryInterface.bulkDelete("BranchEmployees", { branchId: row.branchId, employeeId: row.employeeId }, { transaction });
    }
    return;
  }
  await deleteByIds(queryInterface, TABLE_NAMES[key], getIds(key), transaction);
});

module.exports = {
  RAW_PASSWORDS,
  TABLE_NAMES,
  hashPasswordsByRole,
  upsertRows,
  deleteByIds,
  deleteByUniqueValues,
  createExampleImage,
  slugify,
  chunkArray,
  findRowsByUniqueValues,
  validateUniqueRows,
  getRows,
  seedRoles,
  downRoles,
  seedSystemAccounts,
  downSystemAccounts,
  seedCategories: seedSimpleTable("categories"),
  downCategories: downSimpleTable("categories"),
  seedBranches: seedSimpleTable("branches"),
  downBranches: downSimpleTable("branches"),
  seedBranchImages: seedSimpleTable("branchimages"),
  downBranchImages: downSimpleTable("branchimages"),
  seedCourts: seedSimpleTable("courts"),
  downCourts: downSimpleTable("courts"),
  seedCourtPrices: seedSimpleTable("courtprices"),
  downCourtPrices: downSimpleTable("courtprices"),
  seedProducts: seedSimpleTable("products"),
  downProducts: downSimpleTable("products"),
  seedProductImages: seedSimpleTable("productimages"),
  downProductImages: downSimpleTable("productimages"),
  seedProductVariants: seedSimpleTable("productvariants"),
  downProductVariants: downSimpleTable("productvariants"),
  seedVariantStocks: seedSimpleTable("variantstocks"),
  downVariantStocks: downSimpleTable("variantstocks"),
  seedBeverages: seedSimpleTable("beverages"),
  downBeverages: downSimpleTable("beverages"),
  seedBeverageStocks: seedSimpleTable("beveragestocks"),
  downBeverageStocks: downSimpleTable("beveragestocks"),
  seedSuppliers: seedSimpleTable("suppliers"),
  downSuppliers: downSimpleTable("suppliers"),
  seedDiscounts: seedSimpleTable("discounts"),
  downDiscounts: downSimpleTable("discounts"),
  seedBranchManagers: seedSimpleTable("branchmanagers"),
  downBranchManagers: downSimpleTable("branchmanagers"),
  seedBranchEmployees: seedSimpleTable("branchemployees"),
  downBranchEmployees: downSimpleTable("branchemployees"),
  seedCoachProfiles: seedSimpleTable("coachprofiles"),
  downCoachProfiles: downSimpleTable("coachprofiles"),
};
