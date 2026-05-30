"use strict";

const fs = require("fs");
const path = require("path");

const sourceSqlPath =
  process.argv[2] || path.resolve(__dirname, "..", "..", "badminton.sql");
const outputPath = path.resolve(__dirname, "..", "seeders", "data", "badminton-demo-data.cjs");

const sql = fs.readFileSync(sourceSqlPath, "utf8");

const getInsertValues = (tableName) => {
  const pattern = new RegExp(`INSERT INTO \`${tableName}\` VALUES ([\\s\\S]*?);`);
  const match = sql.match(pattern);
  return match ? parseTuples(match[1]) : [];
};

const parseTuples = (input) => {
  const rows = [];
  let i = 0;

  const skipWhitespace = () => {
    while (/\s/.test(input[i])) i += 1;
  };

  const parseString = () => {
    let value = "";
    i += 1;

    while (i < input.length) {
      const char = input[i];
      if (char === "\\") {
        const next = input[i + 1];
        if (next === "n") value += "\n";
        else if (next === "r") value += "\r";
        else if (next === "t") value += "\t";
        else if (next === "0") value += "\0";
        else value += next;
        i += 2;
        continue;
      }
      if (char === "'") {
        i += 1;
        return value;
      }
      value += char;
      i += 1;
    }

    return value;
  };

  const parseBareValue = () => {
    const start = i;
    while (i < input.length && input[i] !== "," && input[i] !== ")") i += 1;
    const token = input.slice(start, i).trim();
    if (/^null$/i.test(token)) return null;
    if (/^-?\d+(\.\d+)?$/.test(token)) return Number(token);
    return token;
  };

  const parseValue = () => {
    skipWhitespace();
    if (input[i] === "'") return parseString();
    return parseBareValue();
  };

  while (i < input.length) {
    skipWhitespace();
    if (input[i] === ",") {
      i += 1;
      continue;
    }
    if (input[i] !== "(") {
      i += 1;
      continue;
    }

    i += 1;
    const row = [];
    while (i < input.length && input[i] !== ")") {
      row.push(parseValue());
      skipWhitespace();
      if (input[i] === ",") i += 1;
    }
    i += 1;
    rows.push(row);
  }

  return rows;
};

const toDate = (value) => (value ? value.replace(" ", "T") : null);
const mapPeriodType = (value) => String(value).toUpperCase();

const seedTimestamp = "2025-11-25T10:00:00";
const branchId = 1;

const data = {
  branch: {
    id: branchId,
    branchName: "B-Hub Badminton Center",
    phoneNumber: "0901234567",
    description:
      "Chi nhanh mau duoc tao tu badminton.sql de phuc vu demo san cau long va cua hang.",
    address: "231 Le Van Chi, Phuong Linh Trung",
    districtName: "Thanh pho Thu Duc",
    provinceName: "Ho Chi Minh",
    wardName: "Linh Trung",
    provinceId: 202,
    districtId: 1442,
    wardCode: "20101",
    latitude: 10.8505,
    longitude: 106.7717,
    isActive: true,
    ghnShopId: null,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },

  users: getInsertValues("users").map(
    ([id, username, password, email, isVerified, isActive, roleId, createdAt, updatedAt]) => ({
      id,
      username,
      password,
      email,
      isVerified: Boolean(isVerified),
      isActive: Boolean(isActive),
      roleId: roleId === 3 ? 4 : 2,
      createdAt: toDate(createdAt),
      updatedAt: toDate(updatedAt),
    }),
  ),

  profiles: getInsertValues("profiles").map(
    ([id, fullName, dob, gender, address, phoneNumber, avatar, createdAt, updatedAt, userId]) => ({
      id,
      fullName,
      dob: toDate(dob),
      gender,
      address,
      phoneNumber,
      avatar,
      level: "BEGINNER",
      userId,
      createdAt: toDate(createdAt),
      updatedAt: toDate(updatedAt),
    }),
  ),

  categories: getInsertValues("categories").map(
    ([id, cateName, menuGroup, createdAt, updatedAt]) => ({
      id,
      cateName: cateName.trim(),
      menuGroup,
      createdAt: toDate(createdAt),
      updatedAt: toDate(updatedAt),
    }),
  ),

  courts: getInsertValues("courts").map(([id, courtName, location, thumbnailUrl]) => ({
    id,
    branchId,
    courtName,
    location,
    thumbnailUrl,
    courtStatus: "ACTIVE",
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  })),

  courtPrices: getInsertValues("courtprices").map(
    ([id, dayOfWeek, startTime, endTime, price, periodType]) => ({
      id,
      branchId,
      dayOfWeek,
      startTime,
      endTime,
      price,
      periodType: mapPeriodType(periodType),
    }),
  ),

  discounts: getInsertValues("discounts").map(
    ([id, code, type, value, isActive, isUsed, startDate, endDate, minAmount, createdAt, updatedAt]) => ({
      id,
      code,
      type,
      applyType: "ORDER",
      value,
      maxDiscount: null,
      minAmount: minAmount || 0,
      usageLimit: null,
      usageCount: isUsed ? 1 : 0,
      isActive: Boolean(isActive),
      startDate: startDate ? startDate.slice(0, 10) : null,
      endDate: endDate ? endDate.slice(0, 10) : null,
      createdAt: toDate(createdAt),
      updatedAt: toDate(updatedAt),
    }),
  ),

  products: getInsertValues("products").map(
    ([id, productName, brand, description, thumbnailUrl, categoryId, createdAt, updatedAt]) => ({
      id,
      productName,
      brand: brand || "No brand",
      description,
      thumbnailUrl,
      categoryId,
      createdAt: toDate(createdAt),
      updatedAt: toDate(updatedAt),
    }),
  ),

  productImages: getInsertValues("productimages").map(([id, imageUrl, productId]) => ({
    id,
    imageUrl,
    productId,
  })),

  productVariants: getInsertValues("productvarients").map(
    ([id, sku, price, stock, discount, color, size, material, productId]) => ({
      id,
      sku,
      price,
      discount,
      color,
      size,
      material,
      weight: 0.5,
      productId,
      stock,
    }),
  ),

  feedbacks: getInsertValues("productfeedbacks").map(
    ([content, rating, createdAt, updatedAt, userId, variantId], index) => ({
      id: index + 1,
      userId,
      orderId: null,
      variantId,
      branchId: null,
      content,
      rating,
      createdAt: toDate(createdAt),
      updatedAt: toDate(updatedAt),
    }),
  ),

  beverages: [
    {
      id: 1,
      beverageName: "Nuoc suoi B-Hub",
      thumbnailUrl: null,
      price: 10000,
      stock: 100,
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
    {
      id: 2,
      beverageName: "Tra xanh B-Hub",
      thumbnailUrl: null,
      price: 15000,
      stock: 80,
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
  ],
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
  outputPath,
  `"use strict";\n\nmodule.exports = ${JSON.stringify(data, null, 2)};\n`,
);

console.log(`Wrote ${outputPath}`);
console.log(
  Object.entries(data)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.length : 1}`)
    .join("\n"),
);
