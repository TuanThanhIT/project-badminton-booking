"use strict";

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const seedPath = path.join(rootDir, "seeders", "data", "static-seed-data.cjs");
const seedData = require(seedPath);

const branchIds = seedData.branches.map((branch) => branch.id);
const variantIdsWithStock = new Set(seedData.variantstocks.map((stock) => stock.variantId));
let nextStockId = Math.max(0, ...seedData.variantstocks.map((stock) => Number(stock.id) || 0)) + 1;
let added = 0;

for (const variant of seedData.productvariants) {
  if (variantIdsWithStock.has(variant.id)) continue;

  for (const branchId of branchIds) {
    seedData.variantstocks.push({
      id: nextStockId++,
      stock: 10 + ((variant.id + branchId) % 7),
      variantId: variant.id,
      branchId,
    });
    added += 1;
  }
}

fs.writeFileSync(seedPath, `"use strict";\n\nmodule.exports = ${JSON.stringify(seedData, null, 2)};\n`, "utf8");

console.log(`Added variant stock rows: ${added}`);
