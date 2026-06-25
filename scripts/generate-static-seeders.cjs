"use strict";

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const sqlPath = "D:/HOCTAP/KLTN/DatabaseFinal.sql";
const outDir = path.join(projectRoot, "backend", "seeders");
const helperDir = path.join(outDir, "helpers");
const reportDir = path.join(outDir, "reports");
const srcSeederDir = path.join(projectRoot, "backend", "src", "seeders");
const srcHelperDir = path.join(srcSeederDir, "helpers");

const STATIC_TABLES = [
  "roles",
  "users",
  "profiles",
  "wallets",
  "categories",
  "branches",
  "branchimages",
  "courts",
  "courtprices",
  "products",
  "productimages",
  "productvariants",
  "variantstocks",
  "beverages",
  "beveragestocks",
  "suppliers",
  "discounts",
  "branchmanagers",
  "branchemployees",
  "coachprofiles",
];

const BUSINESS_TABLES = [
  "aichatmessages",
  "aichatsessions",
  "bookingdetails",
  "bookings",
  "cartitems",
  "carts",
  "cashregisters",
  "classenrollments",
  "classrooms",
  "coachapplications",
  "comments",
  "conversationparticipants",
  "conversations",
  "draftbeverageitems",
  "draftbookingitems",
  "draftbookings",
  "draftproductitems",
  "feedbacks",
  "messages",
  "monthlybookings",
  "notifications",
  "offlinebookings",
  "orderdetails",
  "ordergroups",
  "ordershippinglogs",
  "orders",
  "payments",
  "postlikes",
  "posts",
  "postshares",
  "purchasereceiptdetails",
  "purchasereceipts",
  "stocktransactions",
  "wallettransactions",
  "withdrawrequests",
];

const UNSAFE_TABLES = ["refreshtokens", "userotps", "sequelizemeta"];

const TABLE_NAMES = {
  roles: "Roles",
  users: "Users",
  profiles: "Profiles",
  wallets: "Wallets",
  categories: "Categories",
  branches: "Branches",
  branchimages: "BranchImages",
  courts: "Courts",
  courtprices: "CourtPrices",
  products: "Products",
  productimages: "ProductImages",
  productvariants: "ProductVariants",
  variantstocks: "VariantStocks",
  beverages: "Beverages",
  beveragestocks: "BeverageStocks",
  suppliers: "Suppliers",
  discounts: "Discounts",
  branchmanagers: "BranchManagers",
  branchemployees: "BranchEmployees",
  coachprofiles: "CoachProfiles",
};

const FILES = [
  ["20260610000100-seed-roles.cjs", "roles", "seedRoles", "downRoles"],
  ["20260610000200-seed-system-accounts.cjs", ["users", "profiles", "wallets"], "seedSystemAccounts", "downSystemAccounts"],
  ["20260610000300-seed-categories.cjs", "categories", "seedCategories", "downCategories"],
  ["20260610000400-seed-branches.cjs", "branches", "seedBranches", "downBranches"],
  ["20260610000500-seed-branch-images.cjs", "branchimages", "seedBranchImages", "downBranchImages"],
  ["20260610000600-seed-courts.cjs", "courts", "seedCourts", "downCourts"],
  ["20260610000700-seed-court-prices.cjs", "courtprices", "seedCourtPrices", "downCourtPrices"],
  ["20260610000800-seed-products.cjs", "products", "seedProducts", "downProducts"],
  ["20260610000900-seed-product-images.cjs", "productimages", "seedProductImages", "downProductImages"],
  ["20260610001000-seed-product-variants.cjs", "productvariants", "seedProductVariants", "downProductVariants"],
  ["20260610001100-seed-variant-stocks.cjs", "variantstocks", "seedVariantStocks", "downVariantStocks"],
  ["20260610001200-seed-beverages.cjs", "beverages", "seedBeverages", "downBeverages"],
  ["20260610001300-seed-beverage-stocks.cjs", "beveragestocks", "seedBeverageStocks", "downBeverageStocks"],
  ["20260610001400-seed-suppliers.cjs", "suppliers", "seedSuppliers", "downSuppliers"],
  ["20260610001500-seed-discounts.cjs", "discounts", "seedDiscounts", "downDiscounts"],
  ["20260610001600-seed-branch-managers.cjs", "branchmanagers", "seedBranchManagers", "downBranchManagers"],
  ["20260610001700-seed-branch-employees.cjs", "branchemployees", "seedBranchEmployees", "downBranchEmployees"],
  ["20260610001800-seed-coach-profiles.cjs", "coachprofiles", "seedCoachProfiles", "downCoachProfiles"],
];

const readSql = () => fs.readFileSync(sqlPath, "utf8");

const splitTupleValues = (tuple) => {
  const values = [];
  let current = "";
  let inString = false;
  let escape = false;
  for (let i = 0; i < tuple.length; i += 1) {
    const char = tuple[i];
    if (inString) {
      current += char;
      if (escape) {
        escape = false;
      } else if (char === "\\") {
        escape = true;
      } else if (char === "'") {
        inString = false;
      }
      continue;
    }
    if (char === "'") {
      inString = true;
      current += char;
    } else if (char === ",") {
      values.push(parseValue(current.trim()));
      current = "";
    } else {
      current += char;
    }
  }
  values.push(parseValue(current.trim()));
  return values;
};

const parseValue = (raw) => {
  if (raw === "NULL") return null;
  if (/^b'([01])'$/.test(raw)) return raw.includes("1");
  if (raw.startsWith("'") && raw.endsWith("'")) {
    return raw
      .slice(1, -1)
      .replace(/\\0/g, "\0")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\b/g, "\b")
      .replace(/\\Z/g, "\x1a")
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  return raw;
};

const splitTuples = (valuesSql) => {
  const tuples = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = 0; i < valuesSql.length; i += 1) {
    const char = valuesSql[i];
    if (inString) {
      if (escape) escape = false;
      else if (char === "\\") escape = true;
      else if (char === "'") inString = false;
      continue;
    }
    if (char === "'") inString = true;
    else if (char === "(") {
      if (depth === 0) start = i + 1;
      depth += 1;
    } else if (char === ")") {
      depth -= 1;
      if (depth === 0 && start >= 0) tuples.push(valuesSql.slice(start, i));
    }
  }
  return tuples;
};

const parseColumns = (sql) => {
  const columns = {};
  const re = /CREATE TABLE `([^`]+)` \(([\s\S]*?)\n\) ENGINE=/g;
  let match;
  while ((match = re.exec(sql))) {
    const table = match[1];
    columns[table] = [];
    for (const line of match[2].split("\n")) {
      const col = line.trim().match(/^`([^`]+)`\s/);
      if (col) columns[table].push(col[1]);
    }
  }
  return columns;
};

const parseRows = (sql, columns) => {
  const data = {};
  const re = /INSERT INTO `([^`]+)` VALUES ([\s\S]*?);/g;
  let match;
  while ((match = re.exec(sql))) {
    const table = match[1];
    const tableColumns = columns[table] || [];
    data[table] = splitTuples(match[2]).map((tuple) => {
      const values = splitTupleValues(tuple);
      return Object.fromEntries(tableColumns.map((column, index) => [column, values[index]]));
    });
  }
  return data;
};

const inferCategoryKind = (category) => {
  const name = String(category.cateName || "").toLowerCase();
  const menu = String(category.menuGroup || "").toLowerCase();
  if (name.includes("vợt") || name.includes("vot") || menu.includes("racket")) return "racket";
  if (name.includes("giày") || name.includes("giay") || menu.includes("shoe")) return "shoe";
  if (name.includes("áo") || name.includes("quần") || name.includes("quan") || name.includes("ao") || menu.includes("fashion")) return "apparel";
  if (name.includes("túi") || name.includes("balo") || name.includes("bag")) return "bag";
  return "accessory";
};

const slugify = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d")
  .replace(/Đ/g, "D")
  .replace(/[^a-zA-Z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .toUpperCase();

const createExampleImage = (text) => `https://placehold.co/800x800/png?text=${encodeURIComponent(text)}`;

const productTemplates = {
  racket: [
    ["Yonex Nanoflare Skill", "Yonex", 1680000],
    ["Victor Auraspeed Flow", "Victor", 1850000],
    ["Li-Ning Wind Lite Pro", "Lining", 1490000],
    ["Mizuno Speedflex 72", "Mizuno", 1720000],
    ["Kumpoo Power Control", "Kumpoo", 1290000],
  ],
  shoe: [
    ["Yonex Court Stride", "Yonex", 1390000],
    ["Victor Speed Cushion", "Victor", 1490000],
    ["Li-Ning Sonic Step", "Lining", 1320000],
    ["Mizuno Wave Court", "Mizuno", 1590000],
    ["Kawasaki Rally Fit", "Kawasaki", 990000],
  ],
  apparel: [
    ["Yonex Dry Match Tee", "Yonex", 360000],
    ["Victor Team Training Shirt", "Victor", 340000],
    ["Li-Ning Cool Dry Short", "Lining", 310000],
    ["Mizuno Flex Court Polo", "Mizuno", 390000],
    ["B-Hub Club Jersey", "B-Hub", 280000],
  ],
  bag: [
    ["Yonex Team Racquet Bag", "Yonex", 890000],
    ["Victor Court Backpack", "Victor", 790000],
    ["Li-Ning Tour Bag", "Lining", 940000],
    ["Kawasaki Match Duffel", "Kawasaki", 690000],
    ["B-Hub Training Backpack", "B-Hub", 520000],
  ],
  accessory: [
    ["Yonex Super Grip Pack", "Yonex", 99000],
    ["Victor Wrist Support", "Victor", 159000],
    ["Li-Ning Training Shuttle", "Lining", 189000],
    ["B-Hub Towel Pro", "B-Hub", 129000],
    ["Kawasaki Grip Powder", "Kawasaki", 89000],
  ],
};

const buildVariant = (product, index, basePrice) => {
  const skuBase = slugify(product.productName).slice(0, 28);
  const kind = product.kind;
  const presets = {
    racket: [
      ["Đen", "4U-G5", "Graphite", 0.083],
      ["Trắng", "3U-G5", "Graphite", 0.088],
      ["Xanh", "4U-G6", "Graphite", 0.082],
    ],
    shoe: [
      ["White", "39", "Mesh", 0.6],
      ["Black", "40", "Synthetic Leather", 0.64],
      ["Gray", "41", "Rubber", 0.66],
    ],
    apparel: [
      ["Navy", "M", "Polyester Dry-fit", 0.24],
      ["White", "L", "Polyester", 0.25],
      ["Red", "XL", "Dry-fit", 0.26],
    ],
    bag: [
      ["Black", "2 ngăn", "Polyester", 0.8],
      ["Blue", "3 ngăn", "PU", 0.9],
      ["Gray", "6 vợt", "Polyester", 1.0],
    ],
    accessory: [
      ["White", "OneSize", "Nylon", 0.05],
      ["Black", "OneSize", "Cotton Blend", 0.06],
      ["Blue", "OneSize", "Synthetic", 0.04],
    ],
  };
  const [color, size, material, weight] = presets[kind][index % presets[kind].length];
  return {
    sku: `${skuBase}-${index + 1}`,
    price: basePrice + index * 30000,
    discount: index === 0 ? 0 : 5,
    color,
    size,
    material,
    weight,
  };
};

const enrichProducts = (data) => {
  const categories = data.categories || [];
  const products = data.products || [];
  const productImages = data.productimages || [];
  const productVariants = data.productvariants || [];
  const variantStocks = data.variantstocks || [];
  const branches = data.branches || [];
  const maxId = (rows) => rows.reduce((max, row) => Math.max(max, Number(row.id || 0)), 0);
  let productId = Math.max(10000, maxId(products) + 1);
  let imageId = Math.max(10000, maxId(productImages) + 1);
  let variantId = Math.max(10000, maxId(productVariants) + 1);
  let stockId = Math.max(10000, maxId(variantStocks) + 1);
  const usedProductNames = new Set(products.map((p) => p.productName));
  const usedSkus = new Set(productVariants.map((v) => v.sku));
  for (const category of categories) {
    const existing = products.filter((p) => Number(p.categoryId) === Number(category.id)).length;
    const missing = Math.max(0, 15 - existing);
    const kind = inferCategoryKind(category);
    for (let i = 0; i < missing; i += 1) {
      const tpl = productTemplates[kind][i % productTemplates[kind].length];
      let productName = `${tpl[0]} ${category.cateName}`.replace(/\s+/g, " ").trim();
      let suffix = 2;
      while (usedProductNames.has(productName)) {
        productName = `${tpl[0]} ${category.cateName} ${suffix}`;
        suffix += 1;
      }
      usedProductNames.add(productName);
      const now = "2026-06-10 00:00:00";
      const product = {
        id: productId,
        productName,
        brand: tpl[1],
        description: `<p>Sản phẩm demo bổ sung cho danh mục ${category.cateName}. Thiết kế phù hợp nhu cầu tập luyện và thi đấu phong trào tại B-Hub.</p>`,
        thumbnailUrl: createExampleImage(productName),
        categoryId: category.id,
        createdAt: now,
        updatedAt: now,
        _demoAdded: true,
        kind,
      };
      products.push(product);
      for (let img = 0; img < 2; img += 1) {
        productImages.push({ id: imageId, imageUrl: createExampleImage(`${productName} ${img + 1}`), productId, _demoAdded: true });
        imageId += 1;
      }
      for (let v = 0; v < 3; v += 1) {
        const variant = buildVariant(product, v, tpl[2]);
        while (usedSkus.has(variant.sku)) variant.sku = `${variant.sku}-${variantId}`;
        usedSkus.add(variant.sku);
        const currentVariantId = variantId;
        productVariants.push({ id: currentVariantId, ...variant, productId, _demoAdded: true });
        for (const branch of branches) {
          const stock = v === 2 && Number(branch.id) % 3 === 0 ? Number(branch.id) % 6 : 12 + ((productId + currentVariantId + Number(branch.id)) % 38);
          variantStocks.push({ id: stockId, variantId: currentVariantId, branchId: branch.id, stock, _demoAdded: true });
          stockId += 1;
        }
        variantId += 1;
      }
      productId += 1;
    }
  }
};

const normalizeData = (data) => {
  for (const key of Object.keys(data)) {
    if (UNSAFE_TABLES.includes(key)) continue;
    data[key] = data[key].map((row) => {
      const copy = { ...row };
      if ("password" in copy) delete copy.password;
      if ("token" in copy) delete copy.token;
      if ("otp" in copy) delete copy.otp;
      if ("expiresAt" in copy && (key === "refreshtokens" || key === "userotps")) delete copy.expiresAt;
      return copy;
    });
  }
  enrichProducts(data);
  return data;
};

const buildDataFile = (data) => {
  const payload = {};
  for (const table of STATIC_TABLES) payload[table] = data[table] || [];
  return `"use strict";\n\nmodule.exports = ${JSON.stringify(payload, null, 2)};\n`;
};

const helperSource = `"use strict";

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

const TABLE_NAMES = ${JSON.stringify(TABLE_NAMES, null, 2)};

const ROLE_ORDER = ["ADMIN", "USER", "EMPLOYEE", "COACH", "MANAGER"];

const createExampleImage = (text) =>
  \`https://placehold.co/800x800/png?text=\${encodeURIComponent(text)}\`;

const slugify = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[\\u0300-\\u036f]/g, "")
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

const getRows = (key) => (seedData[key] || []).map((row) => {
  const copy = { ...row };
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
      if (seen.has(key)) throw new Error(\`\${label}: duplicate \${field} \${row[field]}\`);
      seen.add(key);
    }
  }
};

const findRowsByUniqueValues = async (queryInterface, tableName, field, values, transaction) => {
  if (!values.length) return [];
  return queryInterface.sequelize.query(
    \`SELECT * FROM \\\`\${tableName}\\\` WHERE \\\`\${field}\\\` IN (:values)\`,
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
    return { ...user, password: hashedPasswords[roleName] || hashedPasswords.USER };
  });
  validateUniqueRows(users, ["username", "email"], "Users");
  await upsertRows(queryInterface, "Users", users, transaction, ["password", "email", "isVerified", "isActive", "roleId", "createdAt", "updatedAt"]);
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
`;

const buildSeederFile = (upName, downName) => `"use strict";

const { ${upName}, ${downName} } = require("./helpers/staticSeedUtils.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await ${upName}(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {
    await ${downName}(queryInterface, Sequelize);
  },
};
`;

const checkSql = `-- Static seed verification queries.

SELECT id, roleName FROM Roles ORDER BY id;

SELECT r.roleName, COUNT(u.id) AS totalUsers
FROM Roles r
LEFT JOIN Users u ON u.roleId = r.id
GROUP BY r.id, r.roleName
ORDER BY r.id;

SELECT username, COUNT(*) AS total FROM Users GROUP BY username HAVING COUNT(*) > 1;
SELECT email, COUNT(*) AS total FROM Users GROUP BY email HAVING COUNT(*) > 1;
SELECT userId, COUNT(*) AS total FROM Profiles GROUP BY userId HAVING COUNT(*) > 1;

SELECT id, branchName, address, districtName, wardName, ghnShopId, isActive
FROM Branches
ORDER BY id;

SELECT b.branchName, COUNT(c.id) AS courtCount
FROM Branches b
LEFT JOIN Courts c ON c.branchId = b.id
GROUP BY b.id, b.branchName;

SELECT branchId, dayOfWeek, startTime, endTime, price
FROM CourtPrices
ORDER BY branchId, dayOfWeek, startTime;

SELECT c.cateName, COUNT(p.id) AS productCount
FROM Categories c
LEFT JOIN Products p ON p.categoryId = c.id
GROUP BY c.id, c.cateName
HAVING COUNT(p.id) < 15;

SELECT p.productName, COUNT(pi.id) AS imageCount
FROM Products p
LEFT JOIN ProductImages pi ON pi.productId = p.id
GROUP BY p.id, p.productName
HAVING COUNT(pi.id) = 0;

SELECT p.productName, COUNT(pv.id) AS variantCount
FROM Products p
LEFT JOIN ProductVariants pv ON pv.productId = p.id
GROUP BY p.id, p.productName
HAVING COUNT(pv.id) = 0;

SELECT sku, COUNT(*) AS total FROM ProductVariants GROUP BY sku HAVING COUNT(*) > 1;

SELECT b.branchName, COUNT(vs.id) AS stockRows, SUM(vs.stock) AS totalStock
FROM Branches b
LEFT JOIN VariantStocks vs ON vs.branchId = b.id
GROUP BY b.id, b.branchName;

SELECT variantId, branchId, COUNT(*) AS total
FROM VariantStocks
GROUP BY variantId, branchId
HAVING COUNT(*) > 1;

SELECT b.branchName, COUNT(bs.id) AS stockRows, SUM(bs.stock) AS totalStock
FROM Branches b
LEFT JOIN BeverageStocks bs ON bs.branchId = b.id
GROUP BY b.id, b.branchName;

SELECT beverageId, branchId, COUNT(*) AS total
FROM BeverageStocks
GROUP BY beverageId, branchId
HAVING COUNT(*) > 1;

SELECT code, COUNT(*) AS total FROM Discounts GROUP BY code HAVING COUNT(*) > 1;

SELECT bm.*
FROM BranchManagers bm
JOIN Users u ON u.id = bm.managerId
JOIN Roles r ON r.id = u.roleId
WHERE r.roleName <> 'MANAGER';

SELECT be.*
FROM BranchEmployees be
JOIN Users u ON u.id = be.employeeId
JOIN Roles r ON r.id = u.roleId
WHERE r.roleName <> 'EMPLOYEE';
`;

const buildReport = (data) => {
  const all = Object.keys(data).sort();
  const lines = [
    "# Static Seed Report",
    "",
    "| Table in DatabaseFinal.sql | SQL rows | Seeder rows | Difference | Reason |",
    "|---|---:|---:|---:|---|",
  ];
  for (const table of all) {
    const sqlRows = data[table]?.length || 0;
    const seeded = STATIC_TABLES.includes(table) ? (data[table]?.length || 0) : 0;
    let reason = "Seeded as static data";
    if (BUSINESS_TABLES.includes(table)) reason = "Skipped: generated/business history; covered by 3-month demo seeders";
    if (UNSAFE_TABLES.includes(table)) reason = "Skipped: unsafe/runtime metadata, token, OTP, or Sequelize migration metadata";
    lines.push(`| ${table} | ${sqlRows} | ${seeded} | ${seeded - sqlRows} | ${reason} |`);
  }
  lines.push("", "Generated product rows are included in the static seed data when a category from SQL had fewer than 15 products.");
  lines.push("Demo passwords are fixed by role and hashed during seeding; hashes are not stored in this report.");
  return `${lines.join("\n")}\n`;
};

const main = () => {
  const sql = readSql();
  const columns = parseColumns(sql);
  const data = normalizeData(parseRows(sql, columns));

  fs.mkdirSync(path.join(outDir, "data"), { recursive: true });
  fs.mkdirSync(helperDir, { recursive: true });
  fs.mkdirSync(reportDir, { recursive: true });
  fs.mkdirSync(srcHelperDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, "data", "static-seed-data.cjs"), buildDataFile(data));
  fs.writeFileSync(path.join(helperDir, "staticSeedUtils.cjs"), helperSource);
  fs.writeFileSync(path.join(srcHelperDir, "staticSeedUtils.js"), helperSource);
  for (const [file, _table, upName, downName] of FILES) {
    fs.writeFileSync(path.join(outDir, file), buildSeederFile(upName, downName));
  }
  fs.writeFileSync(path.join(outDir, "check-static-data.sql"), checkSql);
  fs.writeFileSync(path.join(srcSeederDir, "check-static-data.sql"), checkSql);
  fs.writeFileSync(path.join(reportDir, "static-seed-report.md"), buildReport(data));

  const summary = STATIC_TABLES.map((table) => `${TABLE_NAMES[table]}=${data[table]?.length || 0}`).join(", ");
  console.log(summary);
};

main();
