"use strict";
require("dotenv").config();
const axios = require("axios");
const { QueryTypes } = require("sequelize");
const sequelize = require("../src/config/db.js").default;
const baseUrl = (process.env.AI_SERVICE_URL || "http://127.0.0.1:8001").replace(/\/$/, "");

async function main() {
  const [user] = await sequelize.query(
    "SELECT id, username FROM Users WHERE username = 'demo_user1'",
    { type: QueryTypes.SELECT },
  );
  if (!user) return console.log("NO_USER");

  const history = await sequelize.query(
    `SELECT DISTINCT p.id AS productId, p.productName, p.categoryId, c.cateName
     FROM OrderGroups og
     INNER JOIN Orders o ON o.orderGroupId = og.id
     INNER JOIN OrderDetails od ON od.orderId = o.id
     INNER JOIN ProductVariants pv ON od.variantId = pv.id
     INNER JOIN Products p ON pv.productId = p.id
     LEFT JOIN Categories c ON c.id = p.categoryId
     WHERE og.userId = :uid AND og.status = 'PAID'
     ORDER BY p.categoryId, p.id`,
    { replacements: { uid: user.id }, type: QueryTypes.SELECT },
  );

  const products = await sequelize.query(
    `SELECT p.id, p.productName AS name, p.categoryId, MIN(pv.price) AS minPrice
     FROM Products p INNER JOIN ProductVariants pv ON pv.productId = p.id
     GROUP BY p.id, p.productName, p.categoryId`,
    { type: QueryTypes.SELECT },
  );
  const popular = await sequelize.query(
    `SELECT p.id AS productId, SUM(od.quantity) AS soldCount
     FROM OrderDetails od
     INNER JOIN Orders o ON od.orderId = o.id
     INNER JOIN OrderGroups og ON o.orderGroupId = og.id
     INNER JOIN ProductVariants pv ON od.variantId = pv.id
     INNER JOIN Products p ON pv.productId = p.id
     WHERE og.status = 'PAID' GROUP BY p.id ORDER BY soldCount DESC LIMIT 12`,
    { type: QueryTypes.SELECT },
  );

  const payload = {
    mode: "user",
    userId: user.id,
    history: history.map((h) => ({ productId: h.productId, categoryId: h.categoryId })),
    products: products.map((p) => ({
      id: Number(p.id),
      name: p.name,
      categoryId: Number(p.categoryId) || 0,
      minPrice: p.minPrice != null ? Number(p.minPrice) : null,
    })),
    popularProducts: popular.map((p) => ({
      productId: Number(p.productId),
      soldCount: Number(p.soldCount),
    })),
    topK: 6,
  };

  console.log("=== INPUT demo_user1 ===");
  console.log("userId:", user.id);
  console.log("historyCount:", history.length);
  console.log("catalogSize:", products.length);
  console.log("candidateCount (chưa mua):", products.length - history.length);
  console.log("\n--- history (đã mua) ---");
  history.forEach((h) =>
    console.log(`  [${h.categoryId}] ${h.productId} ${(h.productName || "").slice(0, 50)} (${h.cateName || ""})`),
  );

  try {
    const { data } = await axios.post(`${baseUrl}/api/v1/product/train`, { baskets: [], records: [] }, { timeout: 5000 }).catch(() => null);
    void data;
    const meta = await axios.get(`${baseUrl}/api/v1/product/status`, { timeout: 5000 });
    console.log("\n=== MODEL STATUS ===");
    console.log(JSON.stringify(meta.data?.data || meta.data, null, 2));
  } catch (e) {
    console.log("\nMODEL_STATUS:", e.message);
  }

  try {
    const { data } = await axios.post(`${baseUrl}/api/v1/recommend/product`, payload, { timeout: 30000 });
    const out = data?.data ?? data;
    console.log("\n=== OUTPUT gợi ý ===");
    console.log("strategy:", out.strategy);
    console.log("modelUsed:", out.modelUsed);
    (out.items || []).forEach((it, i) =>
      console.log(
        `  ${i + 1}. score=${it.score} | cat=${it.categoryId} | id=${it.productId} | ${(it.productName || "").slice(0, 55)}`,
      ),
    );
  } catch (e) {
    console.log("REC_ERROR:", e.response?.data?.detail || e.message);
  }
}

main().finally(() => sequelize.close());
