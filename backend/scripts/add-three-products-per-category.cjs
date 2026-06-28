"use strict";

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const seedPath = path.join(rootDir, "seeders", "data", "static-seed-data.cjs");

const seedData = require(seedPath);

const CREATED_AT = "2026-06-28 00:00:00";
const PRODUCTS_TO_ADD_PER_CATEGORY = 3;

const stripVietnamese = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

const slugify = (value) =>
  stripVietnamese(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const productTypeLabel = (category) => {
  const menu = stripVietnamese(category.menuGroup).toUpperCase();
  const name = stripVietnamese(category.cateName).toUpperCase();
  if (menu.includes("VOT CAU LONG")) return "Vợt cầu lông";
  if (menu.includes("GIAY CAU LONG")) return "Giày cầu lông";
  if (menu.includes("AO CAU LONG")) return name.includes("AO THE THAO") ? "Áo thể thao" : "Áo cầu lông";
  if (menu.includes("VAY CAU LONG")) return "Váy cầu lông";
  if (menu.includes("QUAN CAU LONG")) return "Quần cầu lông";
  if (menu.includes("TUI VOT CAU LONG")) return name.includes("TUI DUNG GIAY") ? "Túi đựng giày" : "Túi vợt cầu lông";
  if (menu.includes("BALO CAU LONG")) return "Balo cầu lông";
  return category.cateName;
};

const categoryType = (category) => {
  const menu = stripVietnamese(category.menuGroup).toUpperCase();
  const name = stripVietnamese(category.cateName).toUpperCase();
  if (menu.includes("VOT CAU LONG")) return "racket";
  if (menu.includes("GIAY CAU LONG")) return "shoe";
  if (menu.includes("AO CAU LONG")) return "shirt";
  if (menu.includes("VAY CAU LONG")) return "skirt";
  if (menu.includes("QUAN CAU LONG")) return "shorts";
  if (menu.includes("TUI VOT CAU LONG")) return "bag";
  if (menu.includes("BALO CAU LONG")) return "backpack";
  if (name.includes("CUOC")) return "string";
  if (name.includes("QUA CAU")) return "shuttle";
  if (name.includes("VO CAU")) return "socks";
  return "accessory";
};

const seriesByType = {
  racket: ["Control Boost", "Power Drive", "Speed Frame"],
  shoe: ["Court Grip", "Indoor Move", "Aero Step"],
  shirt: ["Match Dry", "Court Fit", "Aero Cool"],
  skirt: ["Court Motion", "Active Pleats", "Match Flex"],
  shorts: ["Court Flex", "Active Dry", "Match Move"],
  bag: ["Pro Carry", "Tour Storage", "Court Travel"],
  backpack: ["Team Pack", "Court Backpack", "Active Carry"],
  string: ["Repulsion Feel", "Durable Control", "Power Touch"],
  shuttle: ["Flight Stable", "Training Flight", "Match Control"],
  socks: ["Court Comfort", "Grip Support", "Active Cushion"],
  accessory: ["Training Select", "Court Utility", "Daily Support"],
};

const variantDefaultsByType = {
  racket: [
    { size: "4U", weight: 0.085, material: "Graphite cao cấp" },
    { size: "3U", weight: 0.089, material: "Graphite cao cấp" },
    { size: "5U", weight: 0.078, material: "Graphite cao cấp" },
  ],
  shoe: [
    { size: "40", weight: 0.72, material: "Da tổng hợp và lưới thoáng khí" },
    { size: "41", weight: 0.74, material: "Da tổng hợp và lưới thoáng khí" },
    { size: "42", weight: 0.76, material: "Da tổng hợp và lưới thoáng khí" },
  ],
  shirt: [
    { size: "M", weight: 0.25, material: "Polyester thoáng khí" },
    { size: "L", weight: 0.26, material: "Polyester thoáng khí" },
    { size: "XL", weight: 0.27, material: "Polyester thoáng khí" },
  ],
  skirt: [
    { size: "S", weight: 0.24, material: "Polyester co giãn" },
    { size: "M", weight: 0.25, material: "Polyester co giãn" },
    { size: "L", weight: 0.26, material: "Polyester co giãn" },
  ],
  shorts: [
    { size: "M", weight: 0.24, material: "Polyester co giãn" },
    { size: "L", weight: 0.25, material: "Polyester co giãn" },
    { size: "XL", weight: 0.26, material: "Polyester co giãn" },
  ],
  bag: [
    { size: "3 ngăn", weight: 0.95, material: "Polyester chống bám bẩn" },
    { size: "6 vợt", weight: 1.05, material: "Polyester chống bám bẩn" },
    { size: "Tournament", weight: 1.15, material: "Polyester chống bám bẩn" },
  ],
  backpack: [
    { size: "20L", weight: 0.72, material: "Polyester chống bám bẩn" },
    { size: "24L", weight: 0.78, material: "Polyester chống bám bẩn" },
    { size: "28L", weight: 0.84, material: "Polyester chống bám bẩn" },
  ],
  accessory: [
    { size: "Tiêu chuẩn", weight: 0.15, material: "Vật liệu thể thao tổng hợp" },
    { size: "Cao cấp", weight: 0.18, material: "Vật liệu thể thao tổng hợp" },
    { size: "Thi đấu", weight: 0.2, material: "Vật liệu thể thao tổng hợp" },
  ],
};

const maxId = (rows) => Math.max(0, ...rows.map((row) => Number(row.id) || 0));
const categoriesById = new Map(seedData.categories.map((category) => [category.id, category]));
const branches = seedData.branches.map((branch) => branch.id);
const productsByCategory = new Map();
const variantsByProduct = new Map();

for (const product of seedData.products) {
  if (!productsByCategory.has(product.categoryId)) productsByCategory.set(product.categoryId, []);
  productsByCategory.get(product.categoryId).push(product);
}

for (const variant of seedData.productvariants) {
  if (!variantsByProduct.has(variant.productId)) variantsByProduct.set(variant.productId, []);
  variantsByProduct.get(variant.productId).push(variant);
}

let nextProductId = maxId(seedData.products) + 1;
let nextVariantId = maxId(seedData.productvariants) + 1;
let nextStockId = maxId(seedData.variantstocks) + 1;

const usedNames = new Set(seedData.products.map((product) => product.productName.toLowerCase()));
const usedSkus = new Set(seedData.productvariants.map((variant) => variant.sku.toLowerCase()));

const uniqueName = (baseName) => {
  let name = baseName;
  let suffix = 2;
  while (usedNames.has(name.toLowerCase())) {
    name = `${baseName} ${suffix}`;
    suffix += 1;
  }
  usedNames.add(name.toLowerCase());
  return name;
};

const uniqueSku = (baseSku) => {
  let sku = baseSku.slice(0, 60);
  let suffix = 2;
  while (usedSkus.has(sku.toLowerCase())) {
    sku = `${baseSku.slice(0, 54)}-${suffix}`;
    suffix += 1;
  }
  usedSkus.add(sku.toLowerCase());
  return sku;
};

const descriptionFor = (templateProduct, oldName, newName) =>
  String(templateProduct.description || "")
    .split(oldName)
    .join(newName);

let addedProducts = 0;
let addedVariants = 0;
let addedStocks = 0;

for (const category of seedData.categories) {
  const products = [...(productsByCategory.get(category.id) || [])].sort((left, right) => left.id - right.id);
  if (!products.length) continue;

  const templateProduct = products[products.length - 1];
  const templateVariants = variantsByProduct.get(templateProduct.id) || variantsByProduct.get(products[0].id) || [];
  const type = categoryType(category);
  const variantDefaults = variantDefaultsByType[type] || variantDefaultsByType.accessory;
  const series = seriesByType[type] || seriesByType.accessory;
  const brand = templateProduct.brand || category.cateName.replace(productTypeLabel(category), "").trim() || "B-Hub";

  for (let offset = 0; offset < PRODUCTS_TO_ADD_PER_CATEGORY; offset += 1) {
    const productId = nextProductId++;
    const pageTwoIndex = products.length + offset + 1;
    const productName = uniqueName(
      `${productTypeLabel(category)} ${brand} ${series[offset % series.length]} Page 2 ${pageTwoIndex}`,
    );

    seedData.products.push({
      ...templateProduct,
      id: productId,
      productName,
      brand,
      description: descriptionFor(templateProduct, templateProduct.productName, productName),
      categoryId: category.id,
      createdAt: CREATED_AT,
      updatedAt: CREATED_AT,
    });
    addedProducts += 1;

    const sourceVariants = templateVariants.length ? templateVariants.slice(0, 3) : variantDefaults;
    sourceVariants.forEach((sourceVariant, variantIndex) => {
      const defaults = variantDefaults[variantIndex % variantDefaults.length];
      const variantId = nextVariantId++;
      const size = sourceVariant.size || defaults.size;
      const sku = uniqueSku(`BH-P2-${category.id}-${productId}-${slugify(size || variantIndex + 1)}`);

      seedData.productvariants.push({
        id: variantId,
        sku,
        price: sourceVariant.price || templateVariants[0]?.price || 350000,
        discount: sourceVariant.discount ?? 8,
        color: sourceVariant.color || ["Đen", "Trắng", "Xanh dương"][variantIndex % 3],
        size,
        material: sourceVariant.material || defaults.material,
        weight: sourceVariant.weight || defaults.weight,
        productId,
      });
      addedVariants += 1;

      for (const branchId of branches) {
        seedData.variantstocks.push({
          id: nextStockId++,
          stock: 8 + ((category.id + offset + variantIndex + branchId) % 9),
          variantId,
          branchId,
        });
        addedStocks += 1;
      }
    });
  }
}

fs.writeFileSync(seedPath, `"use strict";\n\nmodule.exports = ${JSON.stringify(seedData, null, 2)};\n`, "utf8");

console.log(`Added products: ${addedProducts}`);
console.log(`Added variants: ${addedVariants}`);
console.log(`Added variant stocks: ${addedStocks}`);
